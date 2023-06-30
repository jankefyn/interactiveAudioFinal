var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import { MongoClient } from 'mongodb';
const app = express();
const port = 3000;
// MongoDB connection setup
const uri = 'mongodb+srv://FynnJ:nicnjX5MjRSm4wtu@gis-ist-geil.wb5k5.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri);
function connectToMongoDB() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.connect();
            console.log('Connected to MongoDB');
        }
        catch (error) {
            console.error('Error connecting to MongoDB', error);
        }
    });
}
// Save location endpoint
app.post('/saveLocation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, latitude, longitude, soundUrl } = req.body;
    try {
        const db = client.db('Interactive_Audio');
        const locationsCollection = db.collection('locations');
        const location = {
            name,
            latitude,
            longitude,
            soundUrl,
        };
        // Insert the location document
        const result = yield locationsCollection.insertOne(location);
        console.log('Location inserted successfully');
        res.status(200).json({ success: true, locationId: result.insertedId.toString() });
    }
    catch (error) {
        console.error('Error inserting location', error);
        res.status(500).json({ success: false, error: 'Failed to save location' });
    }
}));
