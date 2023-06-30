import express, { Request, Response } from 'express';
import { MongoClient, Db, ObjectId } from 'mongodb';
import cors from 'cors';

const app = express();
const port = 3000;

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
  soundUrl: string;
}

// Save location endpoint
app.post('/saveLocation', async (req: Request, res: Response) => {
  const { id, name, latitude, longitude, soundUrl } = req.body as Location;

  try {
    const db: Db = client.db('Interactive_Audio');
    const locationsCollection = db.collection<Location>('locations');

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
  } catch (error) {
    console.error('Error inserting location', error);
    res.status(500).json({ success: false, error: 'Failed to save location' });
  }
});

// Apply CORS middleware
const allowedOrigins = ['http://127.0.0.1:5500/index.html']; // Add your client's domain here
app.use(cors({
  origin: allowedOrigins,
}));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectToMongoDB();
});