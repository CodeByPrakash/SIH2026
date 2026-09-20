let mongooseModule: typeof import("mongoose") | null = null;
try {
  mongooseModule = require("mongoose");
} catch (e) {
  console.warn("Could not load mongoose module:", e);
}

interface MongooseCache {
  conn: any;
  promise: any;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function dbConnect(): Promise<any> {
  const MONGODB_URI = process.env.MONGODB_URI;

  // Server-side safe diagnostic (DO NOT print credentials or full URI)
  console.log("MONGODB_URI exists:", Boolean(MONGODB_URI));
  console.log("MONGODB_URI starts with mongodb+srv:", MONGODB_URI ? MONGODB_URI.startsWith("mongodb+srv") : false);

  if (!MONGODB_URI) {
    console.warn("MONGODB_URI environment variable is missing. Running in fallback dummy mode.");
    return null;
  }

  if (!mongooseModule) {
    try {
      mongooseModule = require("mongoose");
    } catch {
      console.warn("Mongoose module unavailable. Running in fallback mode.");
      return null;
    }
  }

  const mod = mongooseModule;
  if (!mod) {
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mod
      .connect(MONGODB_URI, opts)
      .then((m) => {
        return m;
      })
      .catch((err) => {
        console.warn("MongoDB connection failed, operating with mock fallback:", err.message || err);
        cached.promise = null;
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch {
    cached.promise = null;
    cached.conn = null;
  }

  return cached.conn;
}
