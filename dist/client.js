"use strict";
document.addEventListener('DOMContentLoaded', function () {
    const saveLocationButton = document.getElementById('saveLocationButton');
    if (saveLocationButton) {
        saveLocationButton.addEventListener('click', saveLocation);
    }
    async function saveLocation() {
        const serverUrl = 'http://localhost:5500'; // Replace with your server's URL
        const requestData = {
            id: 1,
            name: "Random Location",
            latitude: 37.7749,
            longitude: -122.4194,
            soundUrl: "https://example.com/sound.mp3"
        };
        const xhr = new XMLHttpRequest();
        xhr.open('POST', serverUrl + `/saveLocation`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    console.log('Server response:', xhr.responseText);
                }
                else {
                    console.error('Error:', xhr.status);
                }
            }
        };
        xhr.send(JSON.stringify(requestData));
    }
    ;
});
