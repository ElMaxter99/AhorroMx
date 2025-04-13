const mongoose = require('mongoose');

const config = require('../config');

const { logger } = require('../src/utils/logger');

const { NODE_ENVS } = require('../src/enums/constants');

const connectDB = async () => {
  try {
    if (config.NODE_ENV === NODE_ENVS.DEV) {
      mongoose.set('debug', true);
    }

    await mongoose.connect(config.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });

    logger.info('✅ MongoDB connected OK !');
  } catch (error) {
    logger.error('❌ Error MongoDB KO:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
