import { MongoClient, Db } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  const connectionUri = process.env.MONGODB_URI;
  if (!connectionUri) {
    throw new Error("MONGODB_URI environment variable is not defined.");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(connectionUri);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      client = new MongoClient(connectionUri);
      clientPromise = client.connect();
    }
    return clientPromise;
  }
}

export async function getMongoDb(dbName = "engineeros"): Promise<Db> {
  const mongoClient = await getMongoClient();
  return mongoClient.db(dbName);
}
