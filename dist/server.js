"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 5500;
// Apply CORS middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' })); // Parse JSON request bodies
// MongoDB connection setup
const uri = 'mongodb+srv://FynnJ:nicnjX5MjRSm4wtu@gis-ist-geil.wb5k5.mongodb.net/?retryWrites=true&w=majority';
const client = new mongodb_1.MongoClient(uri);
async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    }
    catch (error) {
        console.error('Error connecting to MongoDB', error);
    }
}
app.post('/saveLocation', async (req, res) => {
    const { id, name, latitude, longitude, recordedAudio } = req.body;
    try {
        const db = client.db('Interactive_Audio');
        const locationsCollection = db.collection('locations');
        const audioBuffer = Buffer.from(recordedAudio, 'base64');
        const location = {
            id,
            name,
            latitude,
            longitude,
            recordedAudio: recordedAudio
        };
        // Insert the location document
        const result = await locationsCollection.insertOne(location);
        console.log('Location inserted successfully');
        res.status(200).json({ success: true, locationId: result.insertedId.toString() });
    }
    catch (error) {
        console.error('Error inserting location', error);
        res.status(500).json({ success: false, error: 'Failed to save location' });
    }
});
// Get all locations endpoint
app.get('/getLocations', async (req, res) => {
    try {
        const db = client.db('Interactive_Audio');
        const locationsCollection = db.collection('locations');
        const locations = await locationsCollection.find().toArray();
        console.log('Locations retrieved successfully');
        res.status(200).json({ success: true, locations });
    }
    catch (error) {
        console.error('Error retrieving locations', error);
        res.status(500).json({ success: false, error: 'Failed to retrieve locations' });
    }
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectToMongoDB();
});
