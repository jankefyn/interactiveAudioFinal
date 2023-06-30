const { MongoClient } = require('mongodb');
const express = require('express');
const app = express();
const port = 3000;

// MongoDB connection parameters
const uri = 'mongodb+srv://FynnJ:nicnjX5MjRSm4wtu@gis-ist-geil.wb5k5.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri);

// Connect to MongoDB
(async () => {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    // Set up API endpoints

    // Insert a location into the database
    app.post('/api/locations', async (req, res) => {
      const { name, latitude, longitude, soundUrl } = req.body;
      const db = client.db('Interactive_Audio');
      const locationsCollection = db.collection('locations');

      const location = {
        name,
        latitude,
        longitude,
        soundUrl,
      };

      try {
        await locationsCollection.insertOne(location);
        console.log('Location inserted successfully');
        res.sendStatus(200);
      } catch (error) {
        console.error('Error inserting location', error);
        res.sendStatus(500);
      }
    });

    // Retrieve locations from the database
    app.get('/api/locations', async (req, res) => {
      const db = client.db('Interactive_Audio');
      const locationsCollection = db.collection('locations');

      try {
        const documents = await locationsCollection.find().toArray();
        const locations = documents.map(document => ({
          _id: document._id,
          name: document.name,
          latitude: document.latitude,
          longitude: document.longitude,
          soundUrl: document.soundUrl,
        }));
        console.log('Retrieved locations:', locations);
        res.json(locations);
      } catch (error) {
        console.error('Error retrieving locations', error);
        res.sendStatus(500);
      }
    });

    // Start the server
    app.listen(port, () => {
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
})();