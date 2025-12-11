import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('env.local failā nav iestatīts MONGODB_URI');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

const connect = async () => {
  if (cached.conn) {
    console.log('MongoDB ir savienots (no cache).'); // "Aus dem Cache"
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: 'dobrix_db',
      bufferCommands: true,
    };

    console.log('MongoDB savienojums ir procesā...');
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('Savienojums ar MongoDB izveidots veiksmīgi.'); // "Erfolg"
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Kļūda savienojoties ar MongoDB:', e);
    throw e;
  }

  return cached.conn;
};

export default connect;
