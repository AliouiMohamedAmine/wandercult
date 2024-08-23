const container = document.getElementById("bottom");
let allCities = [];

function performSearch() {
  const searchInput = document.getElementById("searchInput").value;
  window.location.href = `/home?search=${encodeURIComponent(searchInput)}`;
}

function createCard(title, description) {
  return `
    <div class="card" onclick="goToCityInfo('${title}')">
      <img src="assets/images/neon.avif" alt="card-image5" class="card-image" />
      <div class="cardText">
        <h2>${title}</h2>
        <p>${description}</p>
      </div>
    </div>
  `;
}

function goToCityInfo(title) {
  window.location.href = `/cityInfo?city=${encodeURIComponent(title)}`;
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
  container.innerHTML = "";
  cities.forEach((city) => {
    const card = createCard(city.city, city.admin_name);
    container.innerHTML += card;
  });
}

function filterCities() {
  const searchInput = document.getElementById("searchInput").value.toLowerCase();
  const filteredCities = allCities.filter((city) =>
    city.city.toLowerCase().startsWith(searchInput)
  );
  displayCities(filteredCities);
}

fetchCities();



document.getElementById('saveButton').addEventListener('click', function(event) {
    event.preventDefault();

    const city = document.getElementById('destination').value;
    const neighborhood = document.getElementById('lot').value;
    const description = document.getElementById('description').value;

    fetch('/api/reports', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ city, neighborhood, description })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('Report saved successfully!');
        // Clear the form
        document.getElementById('destination').value = '';
        document.getElementById('lot').value = '';
        document.getElementById('description').value = '';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to save the report.');
    });
});
