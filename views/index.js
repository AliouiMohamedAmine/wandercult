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


  
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const cityNameElement = document.getElementById('city-name');
  const cityNameElement1 = document.getElementById('city-name1');
  const cityDescriptionElement = document.getElementById('city-description');
  const cityImageElement = document.getElementById('city-image');
  const scamsContainer = document.querySelector('.scam-list');
  
  async function getCityData(city) {
    try {
      const response = await fetch(`/api/cities?name=${city}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data[0]; // Assuming the API returns an array with one element
    } catch (error) {
      console.error('Error fetching city data:', error);
      return null;
    }
  }
  
  async function displayCityData(city) {
    const cityData = await getCityData(city);
    if (cityData) {
      cityNameElement.textContent = cityData.name;
      cityNameElement1.textContent = cityData.name;
      cityDescriptionElement.textContent = cityData.description;
      cityImageElement.src = cityData.imageUrl;
    } else {
      cityDescriptionElement.textContent = `No data available for ${city}.`;
      cityImageElement.src = '';
    }
  }
  
  async function getScamsForCity(city) {
    try {
      const response = await fetch(`/api/reports?city=${city}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching scam data:', error);
      return [];
    }
  }
  
  async function displayScamsForCity(city) {
    scamsContainer.innerHTML = ''; // Effacer le contenu précédent
    cityNameElement.textContent = city;
    cityNameElement1.textContent = city;
  
    const scams = await getScamsForCity(city);
  
    if (scams.length === 0) {
      const noScamsMessage = document.createElement('p');
      noScamsMessage.textContent = `Aucune arnaque trouvée pour la ville de ${city}.`;
      scamsContainer.appendChild(noScamsMessage);
    } else {
      scams.forEach(scam => {
        const scamElement = document.createElement('div');
        scamElement.classList.add('scam-item');
  
        const scamTitle = document.createElement('h3');
        scamTitle.textContent = `Neighborhood: ${scam.neighborhood}`;
  
        const scamDescription = document.createElement('p');
        scamDescription.textContent = `Description: ${scam.description}`;
  
        scamElement.appendChild(scamTitle);
        scamElement.appendChild(scamDescription);
        scamsContainer.appendChild(scamElement);
      });
    }
  }
  
  searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
      window.location.href = `/disti_cherche.html?city=${searchTerm}`;
    }
  });
  
  const urlParams = new URLSearchParams(window.location.search);
  const cityFromUrl = urlParams.get('city');
  if (cityFromUrl) {
    displayCityData(cityFromUrl);
    displayScamsForCity(cityFromUrl);
  } else {
    displayCityData('Rabat'); // Afficher les arnaques de Rabat par défaut
    displayScamsForCity('Rabat');
  }
  