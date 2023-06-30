"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 3000;
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
// Save location endpoint
app.post('/saveLocation', async (req, res) => {
    const { id, name, latitude, longitude, soundUrl } = req.body;
    try {
        const db = client.db('Interactive_Audio');
        const locationsCollection = db.collection('locations');
        const location = {
            id,
            name,
            latitude,
            longitude,
            soundUrl,
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
// Apply CORS middleware
const allowedOrigins = ['http://127.0.0.1:5500/index.html']; // Add your client's domain here
app.use((0, cors_1.default)({
    origin: allowedOrigins,
}));
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectToMongoDB();
});
