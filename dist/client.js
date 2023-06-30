"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const locationsList = document.getElementById('locationsList');
    // Fetch locations from the server and update the UI
    function fetchLocations() {
        fetch('/api/locations')
            .then(response => response.json())
            .then(locations => {
            locationsList.innerHTML = '';
            locations.forEach(location => {
                const li = document.createElement('li');
                li.textContent = location.name;
                locationsList.appendChild(li);
            });
        })
            .catch(error => {
            console.error('Error fetching locations:', error);
        });
    }
    // Event listener for the start button
    startButton.addEventListener('click', () => {
        fetchLocations();
    });
});
