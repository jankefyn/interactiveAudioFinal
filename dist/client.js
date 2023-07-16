"use strict";
var Microsoft;
(function (Microsoft) {
    document.addEventListener('DOMContentLoaded', function () {
        const saveLocationButton = document.getElementById('saveLocationButton');
        if (saveLocationButton) {
            saveLocationButton.addEventListener('click', saveLocation);
        }
        async function saveLocation() {
            const serverUrl = 'https://interactive-audio-ce2f52bf3463.herokuapp.com/'; // Replace with your server's URL
            const requestData = {
                id: 1,
                name: "" + prompt("Enter a name for the location"),
                latitude: currentPosition.coords.latitude,
                longitude: currentPosition.coords.longitude,
                recordedAudio: "" // Placeholder for recorded audio data
            };
            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(mediaStream);
            const audioChunks = [];
            mediaRecorder.addEventListener('dataavailable', (event) => {
                audioChunks.push(event.data);
            });
            mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64Data = reader.result?.toString();
                    requestData.recordedAudio = base64Data || "";
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
                };
                reader.readAsDataURL(audioBlob);
            });
            // Prompt the user to start recording
            alert('Click OK to start recording audio.');
            mediaRecorder.start();
            // Prompt the user to stop recording after a certain duration (e.g., 5 seconds)
            setTimeout(() => {
                mediaRecorder.stop();
            }, 5000);
        }
    });
    async function getLocations() {
        const serverUrl = 'https://interactive-audio-ce2f52bf3463.herokuapp.com/'; // Replace with your server's URL
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${serverUrl}/getLocations`, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    const { success, locations } = response;
                    if (success) {
                        console.log('Locations:', locations);
                        receivedlocations = locations;
                    }
                    else {
                        console.error('Error retrieving locations:', response.error);
                    }
                }
                else {
                    console.error('Error:', xhr.status);
                }
            }
        };
        xhr.send();
    }
    //functionality
    let startButton = document.getElementById("startButton");
    let saveLocationButton = document.getElementById("saveLocationButton");
    let playSoundButton = document.getElementById('playSoundButton');
    let mapButton = document.getElementById('mapButton');
    if (startButton != null) {
        startButton.addEventListener("click", startGame);
    }
    if (mapButton != null) {
        mapButton.addEventListener("click", initMap);
    }
    let musicPlaying = false;
    let currentsound = "";
    let currentPosition;
    let lastLocation = "";
    let receivedlocations = [];
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioContext;
    let audioBufferMap = new Map();
    let audioSourceMap = new Map();
    const currentCoordinates = document.getElementById("currentCoordinates");
    const options = {
        enableHighAccuracy: true,
        maximumAge: 0,
    };
    async function startGame() {
        if (startButton != null) {
            startButton.classList.add("hidden");
        }
        if (saveLocationButton != null) {
            saveLocationButton.classList.remove("hidden");
        }
        if (mapButton != null) {
            mapButton.classList.remove("hidden");
        }
        await getLocations();
        audioContext = new AudioContext();
        for (let location of receivedlocations) {
            console.log(location.recordedAudio);
        }
        if ("geolocation" in navigator) {
            /* geolocation is available */
            navigator.geolocation.watchPosition(success, error, options);
        }
        else {
            /* geolocation IS NOT available */
            currentCoordinates.textContent = "coordinates not available";
        }
    }
    function success(_pos) {
        currentPosition = _pos;
        checkForLocations(_pos);
    }
    function checkDistanceBetween(_pos, _lat, _long) {
        let R = 6371; // Radius of the earth in km
        let dLat = deg2rad(_lat - _pos.coords.latitude); // deg2rad below
        let dLon = deg2rad(_long - _pos.coords.longitude);
        let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(_pos.coords.latitude)) * Math.cos(deg2rad(_lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }
    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
    function error() {
        alert("error");
    }
    function checkForLocations(_currentCoordinates) {
        for (let location of receivedlocations) {
            let d = checkDistanceBetween(_currentCoordinates, location.latitude, location.longitude);
            if (!musicPlaying) {
                if (d < 1.5) {
                    if (playSoundButton) {
                        playSoundButton.addEventListener('click', playEncodedAudio);
                        playSoundButton.classList.remove("hidden");
                    }
                    musicPlaying = true;
                    currentsound = location.recordedAudio;
                    lastLocation = location.name;
                    currentCoordinates.textContent = " du befindest dich in der nähe von: " + location.name + " deshalb hörst du etwas.";
                    break;
                }
            }
            if (musicPlaying && location.name === lastLocation && d > 10) {
                if (saveLocationButton != null) {
                    saveLocationButton.classList.add("hidden");
                }
                stopAudio();
                musicPlaying = false;
            }
        }
    }
    //audio
    let sourceNode = null;
    function playEncodedAudio() {
        // Extract the base64 data after the comma
        const base64Data = currentsound.split(",")[1];
        // Create a new AudioContext
        const audioContext = new AudioContext();
        // Decode the base64 audio data
        const audioData = atob(base64Data);
        const buffer = Uint8Array.from(audioData, c => c.charCodeAt(0));
        // Create an AudioBufferSourceNode
        const source = audioContext.createBufferSource();
        // Decode the audio buffer
        audioContext.decodeAudioData(buffer.buffer, decodedBuffer => {
            // Set the decoded buffer as the source buffer
            source.buffer = decodedBuffer;
            // Create an intermediate GainNode
            const gainNode = audioContext.createGain();
            // Connect the source node to the gain node
            source.connect(gainNode);
            // Connect the gain node to the audio destination (e.g., speakers)
            gainNode.connect(audioContext.destination);
            // Enable looping for the audio
            source.loop = true; // This line enables looping
            // Start playing the audio
            source.start();
        });
    }
    function stopAudio() {
        if (sourceNode) {
            sourceNode.stop();
            sourceNode.disconnect();
            sourceNode = null;
        }
    }
    /*
    async function loadSound(_sound: string): Promise<void> {
      let filePath: string = "";
      let number: number = +_sound;
      switch (number) {
        case 1:
          filePath = "../sounds/iBau.mp3"
          console.log("Case 1");
          break;
        case 2:
          console.log("Case 2");
          break;
        case 3:
          console.log("Case 3");
          break;
        case 4:
          console.log("Case 4");
          break;
        case 5:
          console.log("Case 5");
          break;
        case 6:
          console.log("Case 6");
          break;
        case 7:
          console.log("Case 7");
          break;
        case 8:
          console.log("Case 8");
          break;
        default:
          console.log("Invalid case");
          break;
      }
    
      let response: Response = await fetch(filePath);
      let arraybuffer: ArrayBuffer = await response.arrayBuffer();
      let audioBuffer: AudioBuffer = await audioContext.decodeAudioData(arraybuffer);
      audioBufferMap.set(filePath, audioBuffer);
    }*/
    /*function playAudioFromFile(song: string, loop: boolean = false): void {
      const audioContext = new AudioContext();
      let number: number = +song;
      let filePath: string = "";
    
      switch (number) {
        case 1:
          filePath = "../sounds/iBau.mp3"
          console.log("Case 1");
          break;
        case 2:
          console.log("Case 2");
          break;
        case 3:
          console.log("Case 3");
          break;
        case 4:
          console.log("Case 4");
          break;
        case 5:
          console.log("Case 5");
          break;
        case 6:
          console.log("Case 6");
          break;
        case 7:
          console.log("Case 7");
          break;
        case 8:
          console.log("Case 8");
          break;
        default:
          console.log("Invalid case");
          break;
      }
      fetch(filePath)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          sourceNode = audioContext.createBufferSource();
          sourceNode.buffer = audioBuffer;
          if (loop) {
            sourceNode.loop = true;
            sourceNode.loopEnd = audioBuffer.duration;
          }
          sourceNode.connect(audioContext.destination);
          sourceNode.start();
        })
        .catch(error => {
          console.error('Error loading audio:', error);
        });
    }*/
    function initMap() {
        mapButton?.classList.add("hidden");
        const mapElement = document.getElementById("map");
        if (mapElement) {
            const map = new window.Microsoft.Maps.Map(mapElement, {
                center: new window.Microsoft.Maps.Location(0, 0),
                zoom: 14, // Set an appropriate initial zoom level (adjust as needed)
            });
            // Place blue points on the map for each location
            for (let location of receivedlocations) {
                const pin = new window.Microsoft.Maps.Pushpin(new window.Microsoft.Maps.Location(location.latitude, location.longitude), {
                    color: 'blue',
                });
                map.entities.push(pin);
            }
        }
    }
})(Microsoft || (Microsoft = {}));
