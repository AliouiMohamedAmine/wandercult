window.addEventListener('DOMContentLoaded', function() {
  document.getElementById("searchInput").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      event.preventDefault(); 
      console.log("Enter pressed, triggering click.");
      document.getElementById("myButton").click(); 
    }
  });
});

const container = document.getElementById("bottom");
let allCities = [];

function performSearch() {
  const searchInput = document.getElementById("searchInput").value;
  window.location.href = `/home?search=${encodeURIComponent(searchInput)}`;
}





function createCard(title, adminname, population, image, description, arnques,arnques2,arnques3,arnques4,arnques5,lat,lng) {
  return `
    <div class="card" >
      <img src='${escapeQuotes(image)}' alt="card-image5" class="card-image" onclick="goToCityInfo('${escapeQuotes(title)}', '${escapeQuotes(adminname)}', '${escapeQuotes(population)}', '${escapeQuotes(image)}', '${escapeQuotes(description)}', '${escapeQuotes(arnques)}','${escapeQuotes(arnques2)}','${escapeQuotes(arnques3)}','${escapeQuotes(arnques4)}','${escapeQuotes(arnques5)}','${escapeQuotes(lat)}','${escapeQuotes(lng)}')" />
      <div class="cardText">
        <h2>${escapeQuotes(title)}</h2>
        <p>${escapeQuotes(adminname)}</p>
      </div>
      <label class="container2">
        <input type="checkbox" class="save-checkbox" onclick="saveCity(event, '${escapeQuotes(title)}', '${escapeQuotes(adminname)}', '${escapeQuotes(population)}', '${escapeQuotes(image)}', '${escapeQuotes(description)}','${escapeQuotes(arnques)}', '${escapeQuotes(arnques2)}','${escapeQuotes(arnques3)}','${escapeQuotes(arnques4)}','${escapeQuotes(arnques5)}','${escapeQuotes(lat)}','${escapeQuotes(lng)}')">
        <svg class="save-regular" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M0 48C0 21.5 21.5 0 48 0l0 48V441.4l130.1-92.9c8.3-6 19.6-6 27.9 0L336 441.4V48H48V0H336c26.5 0 48 21.5 48 48V488c0 9-5 17.2-13 21.3s-17.6 3.4-24.9-1.8L192 397.5 37.9 507.5c-7.3 5.2-16.9 5.9-24.9 1.8S0 497 0 488V48z"></path></svg>
        <svg class="save-solid" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M0 48V487.7C0 501.1 10.9 512 24.3 512c5 0 9.9-1.5 14-4.4L192 400 345.7 507.6c4.1 2.9 9 4.4 14 4.4c13.4 0 24.3-10.9 24.3-24.3V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48z"></path></svg>
      </label>
    </div>
  `;
}
function escapeQuotes(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

document.addEventListener("DOMContentLoaded", function () {
  fetch("/api/saved-cities")
    .then((response) => response.json())
    .then((data) => {
      const container = document.getElementById("right");
      if (!container) {
        return;
      }
      data.forEach((city) => {
        container.innerHTML += `
        <div class="card">
          <img src='${city.image}' alt="card-image5" class="card-image" onclick="goToCityInfo('${escapeQuotes(city.title)}', '${escapeQuotes(city.adminname)}', '${escapeQuotes(city.population)}', '${escapeQuotes(city.image)}', '${escapeQuotes(city.description)}', '${escapeQuotes(city.arnques)}','${escapeQuotes(city.arnques2)}','${escapeQuotes(city.arnques3)}','${escapeQuotes(city.arnques4)}','${escapeQuotes(city.arnques5)}','${escapeQuotes(city.lat)}','${escapeQuotes(city.lng)}')"/>
          <div class="cardText">
            <h2>${city.title}</h2>
          </div>
          <button onclick="unsaveCity('${city.title}')">Unsave</button>
        </div>
      `;
      });
    })
    .catch((error) =>
      console.error("Error fetching saved cities:", error)
    );
});



function saveCity(
  event,
  title,
  adminname,
  population,
  image,
  description,
  arnques,
  arnques2,
  arnques3,
  arnques4,
  arnques5,
  lat,
  lng
) {
  event.stopPropagation();

  // Check if the city already exists
  fetch(`/api/check-city?title=${encodeURIComponent(title)}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.exists) {
        alert("City already exists!");
      } else {
        // City does not exist, proceed to save it
        const cityData = {
          title,
          adminname,
          population,
          image,
          description,
          arnques,
          arnques2,
          arnques3,
          arnques4,
          arnques5,
          lat,
          lng
        };

        fetch("/api/save-city", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cityData),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Success:", data);
            alert("City saved successfully!");
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("Error saving city. Please try again later.");
          });
      }
    })
    .catch((error) => {
      console.error("Error checking city:", error);
      alert("Error checking city. Please try again later.");
    });
}

function unsaveCity(title) {
  fetch(`/api/unsave-city?title=${encodeURIComponent(title)}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("City unsaved successfully!");
        // Optionally, remove the city card from the UI
        document.querySelector(`#city-card-${title}`).remove();
      } else {
        alert("Error unsaving city. Please try again later.");
      }
    })
}


function goToCityInfo(city, admin_name, population, image, description, arnaques,arnaques2,arnaques3,arnaques4,arnaques5,lat,lng) {
  const url = new URL('/cityInfo', window.location.origin);
  url.searchParams.set('city', city);
  url.searchParams.set('admin_name', admin_name);
  url.searchParams.set('population', population);
  url.searchParams.set('image', image);
  url.searchParams.set('arnaques', arnaques);
  url.searchParams.set('arnaques2', arnaques2);
  url.searchParams.set('arnaques3', arnaques3);
  url.searchParams.set('arnaques4', arnaques4);
  url.searchParams.set('arnaques5', arnaques5);
  url.searchParams.set('description', description);
  url.searchParams.set('lat', lat);
  url.searchParams.set('lng', lng);
  window.location.href = url.toString();
}
function fetchCities() {
  fetch("ma.json")
    .then((response) => response.json())
    .then((data) => {
      allCities = data;
      displayCities(allCities);
    })
    .catch((error) => {
      console.error("Error fetching cities:", error);
    });
}



function displayCities(cities) {
  if (!container) {
    return;
  }
  container.innerHTML = "";
  cities.forEach((city) => {
    const card = createCard(
      city.city,
      city.admin_name,
      city.population,
      city.image,
      city.description,
      city.arnaques,
      city.arnaques2,
      city.arnaques3,
      city.arnaques4,
      city.arnaques5,
      city.lat,
      city.lng
    );
    container.innerHTML += card;
  });
}


function filterCities() {
  const searchInput = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const filteredCities = allCities.filter((city) =>
    city.city.toLowerCase().startsWith(searchInput)
  );
  displayCities(filteredCities);
}

fetchCities();

// Fonction pour obtenir les paramètres de l'URL
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    city: params.get("city"),
    admin_name: params.get("admin_name"),
    population: params.get("population"),
    image: params.get("image"),
    arnaques: params.get("arnaques"),
    arnaques2: params.get("arnaques2"),
    arnaques3: params.get("arnaques3"),
    arnaques4: params.get("arnaques4"),
    arnaques5: params.get("arnaques5"),
    description: params.get("description"),
    lat: params.get("lat"),
    lng: params.get("lng"),
  };
}

// Extraire les informations de la ville
const cityInfo = getQueryParams();

if (document.getElementById("cityName")) {
  document.getElementById("cityName").innerText = cityInfo.city;
}
if (document.getElementById("adminName")) {
  document.getElementById("adminName").innerText = `Admin Name: ${cityInfo.admin_name}`;
}
if (document.getElementById("population")) {
  document.getElementById("population").innerText = `Population: ${cityInfo.population}`;
}
if (document.getElementById("description")) {
  document.getElementById("description").innerText = `description: ${cityInfo.description}`;
}
if (document.getElementById("arnaques")) {
  document.getElementById("arnaques").innerText = `${cityInfo.arnaques}`;
}
if (document.getElementById("arnaques2")) {
  document.getElementById("arnaques2").innerText = `${cityInfo.arnaques2}`;
}
if (document.getElementById("arnaques3")) {
  document.getElementById("arnaques3").innerText = `${cityInfo.arnaques3}`;
}
if (document.getElementById("arnaques4")) {
  document.getElementById("arnaques4").innerText = `${cityInfo.arnaques4}`;
}
if (document.getElementById("arnaques5")) {
  document.getElementById("arnaques5").innerText = `${cityInfo.arnaques5}`;
}
if (document.getElementById("cityImage")) {
  document.getElementById("cityImage").src = cityInfo.image;
  document.getElementById("cityImage").alt = cityInfo.city;
}

// Initialisation de la carte
var map = L.map('map').setView([cityInfo.lat, cityInfo.lng], 12);
      
// Ajouter la couche OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Ajouter un marqueur à Casablanca
var marker = L.marker([cityInfo.lat, cityInfo.lng]).addTo(map)
    .bindPopup(` ${cityInfo.city}`)
    .openPopup();


//scams card