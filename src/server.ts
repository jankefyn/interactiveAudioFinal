import { MongoClient, Db, ObjectId } from 'mongodb';

interface Location {
  _id: ObjectId;
  name: string;
  latitude: number;
  longitude: number;
  soundUrl: string;
}

let locations: Location[] = [];



// Function to insert a location into the database
async function insertLocation(name: string, latitude: number, longitude: number, soundUrl: string): Promise<void> {
  const uri = 'mongodb+srv://FynnJ:nicnjX5MjRSm4wtu@gis-ist-geil.wb5k5.mongodb.net/?retryWrites=true&w=majority';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db: Db = client.db('Interactive_Audio');
    const locationsCollection = db.collection('locations');

    const location = {
      name,
      latitude,
      longitude,
      soundUrl,
    };

    // Insert the location document
    await locationsCollection.insertOne(location);
    console.log('Location inserted successfully');
  } catch (error) {
    console.error('Error inserting location', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Function to retrieve locations from the database
async function getLocations(): Promise<Location[]> {
  const uri = 'mongodb+srv://FynnJ:nicnjX5MjRSm4wtu@gis-ist-geil.wb5k5.mongodb.net/?retryWrites=true&w=majority';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db: Db = client.db('Interactive_Audio');
    const locationsCollection = db.collection('locations');

    // Retrieve all documents from the collection
    const documents = await locationsCollection.find().toArray();

    // Map the MongoDB documents to the Location interface
    const locations: Location[] = documents.map((document: any) => ({
      _id: document._id,
      name: document.name,
      latitude: document.latitude,
      longitude: document.longitude,
      soundUrl: document.soundUrl,
    }));

    console.log('Retrieved locations:', locations);
    return locations;
  } catch (error) {
    console.error('Error retrieving locations', error);
    return [];
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Usage example
console.log(getLocations());



document.addEventListener('DOMContentLoaded', function() {
  const saveLocationButton = document.getElementById('saveLocationButton');

  if (saveLocationButton) {
    saveLocationButton.addEventListener('click', saveLocation);
  }

  async function saveLocation() {
    

    await insertLocation("asdf",2,3,"asdf");
  }
});



//functionality

