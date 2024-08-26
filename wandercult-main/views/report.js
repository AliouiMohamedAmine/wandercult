const container = document.getElementById("bottom");
let allCities = [];

function performSearch() {
  const searchInput = document.getElementById("searchInput").value;
  window.location.href = `/home?search=${encodeURIComponent(searchInput)}`;
}








function filterCities() {
  const searchInput = document.getElementById("searchInput").value.toLowerCase();
  const filteredCities = allCities.filter((city) =>
    city.city.toLowerCase().startsWith(searchInput)
  );
  displayCities(filteredCities);
}



document.getElementById('saveButton').addEventListener('click', function(event) {
    event.preventDefault();

    const city = document.getElementById('destination').value;
    const neighborhood = document.getElementById('lot').value;
    const description = document.getElementById('description').value;

    if (!city || !neighborhood || !description){
      alert("please enter data")
    }else{

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
    });}
});
