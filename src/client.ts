document.addEventListener('DOMContentLoaded', function () {
    const saveLocationButton = document.getElementById('saveLocationButton');

    if (saveLocationButton) {
        saveLocationButton.addEventListener('click', saveLocation);
    }

    async function saveLocation() {
        let id = "234235";
        const name = "asdf";
        const latitude = "234";
        const longitude = "3241";
        const soundUrl = "asdf";

        const response = await fetch('/saveLocation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, name, latitude, longitude, soundUrl }),
          });
        console.log(await response);
        const data = await response.json();
        if (data.success) {
            console.log('Location saved successfully. Location ID:', data.locationId);
        } else {
            console.error('Failed to save location:', data.error);
        }
    }
});