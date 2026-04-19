// MongoDB logic for storing and retrieving roasts and stats
import mongoose from 'mongoose';
import Roast, { IRoastInput } from '../models/Roast';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/roastmyblog';

// Global connection cache - persists across requests
let cachedConnection: typeof mongoose | null = null;

async function connectMongoose() {
  if (cachedConnection) {
    return cachedConnection;
  }
  
  if (mongoose.connection.readyState === 1) {
    cachedConnection = mongoose;
    return mongoose;
  }
  
  try {
    cachedConnection = await mongoose.connect(MONGO_URI);
    return mongoose;
  } catch (error) {
    cachedConnection = null;
    throw error;
  }
}

// Save a new roast document
export async function saveRoast(doc: Omit<IRoastInput, '_id'>) {
  await connectMongoose();
  await Roast.create(doc);
}

// Get the total count of roasts
export async function getRoastCount(): Promise<number> {
  await connectMongoose();
  return Roast.countDocuments();
}

// Get recent roasts, sorted by newest first, with url, avatar, snippet, and timestamp
export async function getRecentRoasts(limit: number): Promise<{
  url: string;
  avatar: string;
  snippet: string;
  timestamp: number;
}[]> {
  await connectMongoose();
  const docs = await Roast.find({}, { url: 1, roast: 1, createdAt: 1, _id: 0 })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  // Deterministic avatar seed (e.g., hash of url)
  function getSeed(str: string) {
    // Simple hash for demo: sum char codes
    return (
      str
        .split("")
        .reduce((acc, c) => acc + c.charCodeAt(0), 0)
        .toString()
    );
  }

  return docs.map((doc: any) => ({
    url: doc.url,
    avatar: getSeed(doc.url),
    snippet: doc.roast?.slice(0, 100) || "",
    timestamp: doc.createdAt,
  }));
}
