namespace Microsoft {

  interface Location {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    recordedAudio: string; // Add a new field for recorded audio file
  }


  document.addEventListener('DOMContentLoaded', function () {
    const saveLocationButton = document.getElementById('saveLocationButton');

    interface Location {
      id: number;
      name: string;
      latitude: number;
      longitude: number;
      recordedAudio: string; // Add a new field for recorded audio file
    }

    if (saveLocationButton) {
      saveLocationButton.addEventListener('click', saveLocation);
    }


    async function saveLocation(): Promise<void> {
      const serverUrl = 'https://interactive-audio-ce2f52bf3463.herokuapp.com/'; // Replace with your server's URL

      const requestData: Location = {
        id: 1,
        name: "" + prompt("Enter a name for the location"),
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
        recordedAudio: "" // Placeholder for recorded audio data
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(mediaStream);
      const audioChunks: Blob[] = [];

      mediaRecorder.addEventListener('dataavailable', (event: BlobEvent) => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result?.toString();
          requestData.recordedAudio = base64Data || "";

          let shouldContinue = true;

          for (let location of receivedlocations) {
            if (location.name == requestData.name || location.name == "") {
              alert("Es gibt bereits eine Location mit diesem name.");
              shouldContinue = false;
              break;
            }
            console.log("testing" + location.name + checkDistanceBetween(currentPosition, location.latitude, location.longitude));
            if (checkDistanceBetween(currentPosition, location.latitude, location.longitude) <= 0.03) {
              alert("du musst dich weiter als 30m von den anderen locations entfernen. Um die anderen eingetragenen Locations zu sehen kannst du die Karte aktivieren.")
              shouldContinue = false;
              break;
            }
          }
          if (!shouldContinue) {
            return;
          }
          refresh();

          const xhr = new XMLHttpRequest();
          xhr.open('POST', serverUrl + `/saveLocation`, true);
          xhr.setRequestHeader('Content-Type', 'application/json');

          xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
              if (xhr.status === 200) {
                console.log('Server response:', xhr.responseText);
              } else {
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

  async function getLocations(): Promise<void> {
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
          } else {
            console.error('Error retrieving locations:', response.error);
          }
        } else {
          console.error('Error:', xhr.status);
        }
      }
    };

    xhr.send();
  }


  //functionality

  let startButton: HTMLElement | null = document.getElementById("startButton");
  let saveLocationButton: HTMLElement | null = document.getElementById("saveLocationButton");
  let playSoundButton: HTMLElement | null = document.getElementById('playSoundButton');
  let mapButton: HTMLElement | null = document.getElementById('mapButton');
  if (startButton != null) {
    startButton.addEventListener("click", startGame);
  }
  if (mapButton != null) {
    mapButton.addEventListener("click", initMap);
  }



  let musicPlaying: boolean = false;
  let currentsound: string = "";
  let currentPosition: GeolocationPosition;
  let lastLocation: string = "";
  let receivedlocations: Location[] = [];
  let closestDistance: number = 999;
  let closestLocation: string = "";

  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioContext: AudioContext;

  let audioBufferMap: Map<string, AudioBuffer> = new Map();
  let audioSourceMap: Map<string, AudioBufferSourceNode> = new Map();
  const currentCoordinates: HTMLParagraphElement = <HTMLParagraphElement>document.getElementById("currentCoordinates");
  const options = {
    enableHighAccuracy: true,
    maximumAge: 0,
  };


  async function startGame(): Promise<void> {
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

    if ("geolocation" in navigator) {
      /* geolocation is available */
      navigator.geolocation.watchPosition(success, error, options);

    } else {
      /* geolocation IS NOT available */
      currentCoordinates.textContent = "coordinates not available";
    }
  }

  async function refresh(): Promise<void> {
    await getLocations();
    initMap()
  }

  function success(_pos: GeolocationPosition): void {

    currentPosition = _pos;
    checkForLocations(_pos);

    for (let location of receivedlocations) {
      if (checkDistanceBetween(currentPosition, location.latitude, location.longitude) < closestDistance) {
        closestDistance = checkDistanceBetween(currentPosition, location.latitude, location.longitude);
        closestLocation = location.name;
      }
      currentCoordinates.textContent = " die naheliegenste Location ist" + closestLocation + " sie ist " + closestDistance + "meter entfernt."
    }
  }
  function checkDistanceBetween(_pos: GeolocationPosition, _lat: number, _long: number) {
    let R: number = 6371; // Radius of the earth in km
    let dLat: number = deg2rad(_lat - _pos.coords.latitude);  // deg2rad below
    let dLon: number = deg2rad(_long - _pos.coords.longitude);
    let a: number = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(_pos.coords.latitude)) * Math.cos(deg2rad(_lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
  }

  function error(): void {
    alert("error");
  }


  function checkForLocations(_currentCoordinates: GeolocationPosition): void {
    for (let location of receivedlocations) {
      let d: number = checkDistanceBetween(_currentCoordinates, location.latitude, location.longitude);
      if (!musicPlaying) {
        if (d < 0.02) {
          if (playSoundButton) {
            playSoundButton.addEventListener('click', playEncodedAudio);
            playSoundButton.classList.remove("hidden");
          }
          musicPlaying = true;
          currentsound = location.recordedAudio;
          lastLocation = location.name;


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

  let sourceNode: AudioBufferSourceNode | null = null;





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

  function stopAudio(): void {
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
      const map: Maps.Map = new window.Microsoft.Maps.Map(mapElement, {
        center: new window.Microsoft.Maps.Location(currentPosition.coords.latitude, currentPosition.coords.longitude),
        zoom: 15, // Set an appropriate initial zoom level (adjust as needed)
      });
      let userLocation = new Microsoft.Maps.Location(
        currentPosition.coords.latitude,
        currentPosition.coords.longitude
      );
      let userPin = new Microsoft.Maps.Pushpin(userLocation);
      map.entities.push(userPin);




      // Place blue points on the map for each location

      for (let location of receivedlocations) {
        const pin = new window.Microsoft.Maps.Pushpin(new window.Microsoft.Maps.Location(location.latitude, location.longitude), {
          color: 'blue',
        });
        map.entities.push(pin);
      }

    }
  }
}