interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  soundUrl: string;
}


document.addEventListener('DOMContentLoaded', function () {
  const saveLocationButton = document.getElementById('saveLocationButton');
  interface Location {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    soundUrl: string;
  }

  if (saveLocationButton) {
    saveLocationButton.addEventListener('click', saveLocation);
  }

  async function saveLocation(): Promise<void> {
    const serverUrl = 'http://localhost:5500'; // Replace with your server's URL

    const requestData: Location = {
      id: 1,
      name: ""+prompt("enter a name for the location"),
      latitude: currentPosition.coords.latitude,
      longitude: currentPosition.coords.longitude,
      soundUrl: ""+prompt("write a url for a sound you want to be played")
    };

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
});

async function getLocations(): Promise<void> {
  const serverUrl = 'http://localhost:5500'; // Replace with your server's URL

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
if (startButton != null) {
  startButton.addEventListener("click", startGame);
}



let musicPlaying: boolean = false;
let currentsound: string = "";
let currentPosition: GeolocationPosition;
let lastLocation: string = "";
let receivedlocations: Location[] = [];

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
  await getLocations();
  audioContext = new AudioContext();
  for (let location of receivedlocations) {
    loadSound(location.soundUrl);
  }
  if ("geolocation" in navigator) {
    /* geolocation is available */
    navigator.geolocation.watchPosition(success, error, options);

  } else {
    /* geolocation IS NOT available */
    currentCoordinates.textContent = "coordinates not available";
  }
}
function success(_pos: GeolocationPosition): void {
  currentCoordinates.textContent = "" + _pos.coords.latitude + ", " + _pos.coords.longitude;
  //currentCoordinates.textContent = currentCoordinates.textContent + "distanz zum ziel" + checkDistanceBetween(_pos, 47.579136, 7.6218368);
  currentPosition = _pos;
  checkForLocations(_pos);
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
      if (d < 1.5) {

        playAudioFromFile(location.soundUrl, true);
        musicPlaying = true;
        currentsound = location.soundUrl;
        lastLocation = location.soundUrl;
        currentCoordinates.textContent = " du befindest dich in der nähe von: " + location.name + " deshalb hörst du etwas."

        break;
      }
    }
    if (musicPlaying && location.name === lastLocation && d > 10) {
      stopAudio();
      musicPlaying = false;
    }
  }
}



//audio

let sourceNode: AudioBufferSourceNode | null = null;

function playAudioFromFile(filePath: string, loop: boolean = false): void {
  const audioContext = new AudioContext();

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
}

function stopAudio(): void {
  if (sourceNode) {
    sourceNode.stop();
    sourceNode.disconnect();
    sourceNode = null;
  }
}
async function loadSound(_url: string): Promise<void> {
  let response: Response = await fetch(_url);
  let arraybuffer: ArrayBuffer = await response.arrayBuffer();
  let audioBuffer: AudioBuffer = await audioContext.decodeAudioData(arraybuffer);
  audioBufferMap.set(_url, audioBuffer);
}
