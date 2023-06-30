document.addEventListener('DOMContentLoaded', function() {
    const saveLocationButton = document.getElementById('saveLocationButton');
  
    if (saveLocationButton) {
      saveLocationButton.addEventListener('click', saveLocation);
    }
  
    async function saveLocation() {
      const id = prompt('enter id')
      const name = prompt('Enter the location name:');
      const latitude = parseFloat(""+prompt('Enter the latitude:'));
      const longitude = parseFloat(""+prompt('Enter the longitude:'));
      const soundUrl = prompt('Enter the sound URL:');
  
      const response = await fetch('/saveLocation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, name, latitude, longitude, soundUrl }),
      });
  
      const data = await response.json();
      if (data.success) {
        console.log('Location saved successfully. Location ID:', data.locationId);
      } else {
        console.error('Failed to save location:', data.error);
      }
    }
  });