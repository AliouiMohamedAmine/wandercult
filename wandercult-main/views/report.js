document.addEventListener("DOMContentLoaded", function() {
  // Perform search function
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", filterCities);

  // Form submission handler
  const reportForm = document.getElementById('reportForm');
  reportForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form from submitting normally

    const submitButton = document.getElementById('submitButton');
    const city = document.getElementById('city').value;
    const neighborhood = document.getElementById('neighborhood').value;
    const description = document.getElementById('description').value;

    if (!city || !neighborhood || !description) {
      alert("Please enter all required fields.");
    } else {
      submitButton.textContent = 'Submitting...';
      submitButton.disabled = true;

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
        document.getElementById('city').value = '';
        document.getElementById('neighborhood').value = '';
        document.getElementById('description').value = '';
        submitButton.textContent = 'Submit Report';
        submitButton.disabled = false;
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Failed to save the report.');
        submitButton.textContent = 'Submit Report';
        submitButton.disabled = false;
      });
    }
  });

  // Filter cities based on input
  function filterCities() {
    const searchInput = searchInput.value.toLowerCase();
    if (!allCities.length) return; // Return if no cities to filter

    const filteredCities = allCities.filter(city =>
      city.city.toLowerCase().startsWith(searchInput)
    );
    displayCities(filteredCities);
  }

  // Example function to display cities (implement as needed)
  function displayCities(cities) {
    // Implement the logic to display the filtered cities
    console.log(cities); // For testing purposes
  }
});
