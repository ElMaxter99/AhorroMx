const mongoose = require('mongoose');
const config = require('../config');

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log('✅ MongoDB connected OK !');
  } catch (error) {
    console.error('❌ Error MongoDB KO:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
