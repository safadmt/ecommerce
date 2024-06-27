import { MongoClient } from 'mongodb'
process.loadEnvFile()

const client = new MongoClient(process.env.MONGO_URL);

async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
  } catch (err) {
    console.error("Connection failed", err);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
