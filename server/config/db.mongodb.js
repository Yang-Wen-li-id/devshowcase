const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devshowcase_db';

/**
 * Connect to MongoDB instance via Mongoose
 */
const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: true
    });
    console.log(`[MongoDB] Connected successfully to ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`);
    return true;
  } catch (error) {
    console.error('[MongoDB] Connection error:', error.message);
    return false;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected from server. Attempting reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Connection event error:', err.message);
});

module.exports = {
  mongoose,
  connectMongoDB
};
