import express, { Request, Response } from 'express';
import { MongoClient, Db, ObjectId } from 'mongodb';
import cors from 'cors';

const app = express();
const port = 5500;

// Apply CORS middleware

app.use(cors("https://jankefyn.github.io/interactiveAudioFinal/"));
app.use(express.json({ limit: '10mb' })); // Parse JSON request bodies

// MongoDB connection setup
const uri = 'mongodb+srv://FynnJ:nicnjX5MjRSm4wtu@gis-ist-geil.wb5k5.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri);

async function connectToMongoDB(): Promise<void> {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
  }
}

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  recordedAudio: String; // Add a new field for recorded audio file
}

app.post('/saveLocation', async (req: Request, res: Response) => {
  const { id, name, latitude, longitude, recordedAudio } = req.body as Location;

  try {
    const db: Db = client.db('Interactive_Audio');
    const locationsCollection = db.collection<Location>('locations');

    const audioBuffer = Buffer.from(recordedAudio, 'base64');

    const location: Location = {
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
  } catch (error) {
    console.error('Error inserting location', error);
    res.status(500).json({ success: false, error: 'Failed to save location' });
  }
});

// Get all locations endpoint
app.get('/getLocations', async (req: Request, res: Response) => {
  try {
    const db: Db = client.db('Interactive_Audio');
    const locationsCollection = db.collection<Location>('locations');

    const locations = await locationsCollection.find().toArray();
    console.log('Locations retrieved successfully');

    res.status(200).json({ success: true, locations });
  } catch (error) {
    console.error('Error retrieving locations', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve locations' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectToMongoDB();
});



