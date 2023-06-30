"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
let locations = [];
// Function to insert a location into the database
function insertLocation(name, latitude, longitude, soundUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const uri = 'mongodb+srv://FynnJ:nicnjX5MjRSm4wtu@gis-ist-geil.wb5k5.mongodb.net/?retryWrites=true&w=majority';
        const client = new mongodb_1.MongoClient(uri);
        try {
            yield client.connect();
            console.log('Connected to MongoDB');
            const db = client.db('Interactive_Audio');
            const locationsCollection = db.collection('locations');
            const location = {
                name,
                latitude,
                longitude,
                soundUrl,
            };
            // Insert the location document
            yield locationsCollection.insertOne(location);
            console.log('Location inserted successfully');
        }
        catch (error) {
            console.error('Error inserting location', error);
        }
        finally {
            yield client.close();
            console.log('Disconnected from MongoDB');
        }
    });
}
// Function to retrieve locations from the database
function getLocations() {
    return __awaiter(this, void 0, void 0, function* () {
        const uri = 'mongodb+srv://FynnJ:nicnjX5MjRSm4wtu@gis-ist-geil.wb5k5.mongodb.net/?retryWrites=true&w=majority';
        const client = new mongodb_1.MongoClient(uri);
        try {
            yield client.connect();
            console.log('Connected to MongoDB');
            const db = client.db('Interactive_Audio');
            const locationsCollection = db.collection('locations');
            // Retrieve all documents from the collection
            const documents = yield locationsCollection.find().toArray();
            // Map the MongoDB documents to the Location interface
            const locations = documents.map((document) => ({
                _id: document._id,
                name: document.name,
                latitude: document.latitude,
                longitude: document.longitude,
                soundUrl: document.soundUrl,
            }));
            console.log('Retrieved locations:', locations);
            return locations;
        }
        catch (error) {
            console.error('Error retrieving locations', error);
            return [];
        }
        finally {
            yield client.close();
            console.log('Disconnected from MongoDB');
        }
    });
}
// Usage example
console.log(getLocations());
document.addEventListener('DOMContentLoaded', function () {
    const saveLocationButton = document.getElementById('saveLocationButton');
    if (saveLocationButton) {
        saveLocationButton.addEventListener('click', saveLocation);
    }
    function saveLocation() {
        return __awaiter(this, void 0, void 0, function* () {
            yield insertLocation("asdf", 2, 3, "asdf");
        });
    }
});
//functionality
