const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from the "views" directory
app.use(express.static(path.join(__dirname, "views")));

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/auth_Wandercult", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 30 seconds
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

// User schema and model
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  googleId: String, // Add Google ID for OAuth
});

userSchema.statics.findOrCreate = async function findOrCreate(
  condition,
  callback
) {
  const self = this;
  let result = await self.findOne(condition);
  if (!result) {
    result = await self.create(condition);
  }
  callback(null, result);
};

const User = mongoose.model("User", userSchema);

// Configure session middleware
app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 600000 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Middleware to disable caching for all routes
app.use((req, res, next) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
});

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/login");
  }
}

// Configure Passport local strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Incorrect email." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Configure Passport to use Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    function (token, tokenSecret, profile, done) {
      User.findOrCreate(
        {
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
        },
        function (err, user) {
          return done(err, user);
        }
      );
    }
  )
);

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Route to initiate Google OAuth
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["https://www.googleapis.com/auth/plus.login", "email"],
  })
);

// Route for Google OAuth callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/home");
  }
);

// Show login page by default
app.get("/", (req, res) => {
  res.render("login", { error: null });
});

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});

app.post("/signup", async (req, res) => {
  try {
    const { username, email, password, repeatPassword } = req.body;

    if (password !== repeatPassword) {
      return res.render("signup", {
        error: "Passwords do not match.",
        username,
        email,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("signup", {
        error: "Email already exists.",
        username,
        email,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.redirect("/login");
  } catch (error) {
    console.error("Error signing up:", error);
    res.render("signup", {
      error: "Error signing up. Please try again later.",
    });
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

// Apply the isAuthenticated middleware to the /home route
app.get("/home", isAuthenticated, (req, res) => {
  res.render("home", { username: req.user.username });
});

app.get("/report", isAuthenticated, (req, res) => {
  res.render("REPORT");
});

app.get("/help", isAuthenticated, (req, res) => {
  res.render("conseils", { username: req.user.username });
});

app.get("/settings", isAuthenticated, (req, res) => {
  res.render("settings", { username: req.user.username });
});

app.get("/saved", isAuthenticated, (req, res) => {
  res.render("savedpage", { username: req.user.username });
});

app.get("/cityInfo", isAuthenticated, (req, res) => {
  res.render("city_info", { username: req.user.username });
});

// Logout route
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie("connect.sid");
      res.redirect("/login");
    });
  });
});

// Report schema and model
const reportSchema = new mongoose.Schema({
  city: String,
  neighborhood: String,
  description: String,
  date: { type: Date, default: Date.now },
});

const Report = mongoose.model("Report", reportSchema);

// City schema and model
const savedCitySchema = new mongoose.Schema({
  title: String,
  adminname: String,
  population: String,
  image: String,
  description: String,
  arnques: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const SavedCity = mongoose.model("SavedCity", savedCitySchema);

// Route to save city data
app.post("/api/save-city", isAuthenticated, async (req, res) => {
  const { title, adminname, population, image, description, arnques } = req.body;
  try {
    const newCity = new SavedCity({
      title,
      adminname,
      population,
      image,
      description,
      arnques,
      user: req.user._id, // Associer l'utilisateur actuel
    });
    await newCity.save();
    res.status(200).json({ message: "City saved successfully!" });
  } catch (error) {
    console.error("Error saving city:", error);
    res.status(500).json({ error: "Error saving city. Please try again later." });
  }
});

// Route to get saved cities
app.get("/api/saved-cities", isAuthenticated, async (req, res) => {
  try {
    const savedCities = await SavedCity.find({ user: req.user._id });
    res.json(savedCities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to check if a city exists
app.get("/api/check-city", isAuthenticated, async (req, res) => {
  const { title } = req.query;
  const { user } = req.query;
  try {
    const existingCity = await SavedCity.findOne({
    title: new RegExp(`^${title}$`, "i"), // Recherche insensible à la casse
    user: req.user._id, // L'utilisateur actuellement connecté
     });
    if (existingCity) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking city:", error);
    res.status(500).json({ error: "Error checking city. Please try again later." });
  }
});



// Route to unsave a city
app.delete("/api/unsave-city", isAuthenticated, async (req, res) => {
  const { title } = req.query;
  console.log(`Attempting to unsave city: ${title}`);

  try {
    // First, find the city
    const city = await SavedCity.findOne({ title: new RegExp(`^${title}$`, "i") });
    console.log("found")
    
    if (city) {
      // If the city exists, delete it
      const deleteResult = await SavedCity.deleteOne({ title: new RegExp(`^${title}$`, "i") });

      if (deleteResult.deletedCount === 1) {
        console.log(`Successfully deleted city: ${title}`);
        res.json({ success: true });
      } else {
        console.error(`Failed to delete city: ${title}`);
        res.status(500).json({ error: "Failed to delete city." });
      }
    } else {
      console.log(`City not found: ${title}`);
      res.json({ success: false, message: "City not found." });
    }
  } catch (error) {
    console.error("Error unsaving city:", error, "Title:", title);
    res.status(500).json({ error: "Error unsaving city. Please try again later." });
  }
});


// Route to add a new report
app.post("/api/reports", (req, res) => {
  const newReport = new Report({
    city: req.body.city,
    neighborhood: req.body.neighborhood,
    description: req.body.description,
  });

  newReport
    .save()
    .then((report) => res.json(report))
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Route to get all reports
app.get("/api/reports", async (req, res) => {
  const { city } = req.query;
  let query = {};

  if (city) {
    query.city = { $regex: new RegExp(`^${city}$`, "i") };
  }

  try {
    const reports = await Report.find(query);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
