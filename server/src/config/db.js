const mongoose = require('mongoose');

let memServer = null;

// Helper to mask MongoDB URI credentials in logs to prevent secret leakage
const maskMongoUri = (uri) => {
  if (!uri) return 'undefined';
  return uri.replace(/\/\/(.*)@/, '//***:***@');
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri && process.env.NODE_ENV === 'production') {
    throw new Error('Fatal: MONGODB_URI environment variable is required in production');
  }

  const maskedUri = maskMongoUri(uri);

  // In production, give Atlas 10s for initial DNS resolution and TLS handshake
  const timeoutMs = process.env.NODE_ENV === 'production' ? 10000 : 3000;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: timeoutMs,
    });
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`[DB] Standard connection to ${maskedUri} failed: ${err.message}`);

    // If in dev or test mode, provide an automatic in-memory fallback
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[DB] Launching fallback MongoMemoryServer for development/testing...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memServer = await MongoMemoryServer.create();
        const memUri = memServer.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`[DB] In-Memory MongoDB Connected: ${maskMongoUri(memUri)}`);
        return conn;
      } catch (memErr) {
        console.error('[DB] Fallback MongoMemoryServer failed:', memErr.message);
        throw err;
      }
    } else {
      throw err;
    }
  }
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memServer) {
    await memServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
