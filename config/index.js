const fs = require('fs');
const path = require('path');
require('dotenv').config();

const jwtPrivateKeyPath = path.join(__dirname, './jwt/jwt-private.pem');
const jwtPublicKeyPath = path.join(__dirname, './jwt/jwt-public.pem');

// Cargar claves RSA (si no existen, lanzar error)
const loadKey = (keyPath, keyName) => {
  if (!fs.existsSync(keyPath)) {
    console.error(`❌ ERROR: ${keyName} no encontrado en ${keyPath}`);
    process.exit(1);
  }
  return fs.readFileSync(keyPath, 'utf8');
};

module.exports = {
  APP_NAME: process.env.APP_NAME || 'SplitFlow',
  APP_VERSION: process.env.APP_VERSION || '1.0.0',
  APP_URL: process.env.APP_URL || 'http://localhost:5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOGS: {
    CONSOLE_LOG_LEVEL: process.env.CONSOLE_LOG_LEVEL || 'info', // Controla el nivel de consola
    LOG_LEVEL: process.env.LOG_LEVEL || 'info' // Controla el nivel general
  },
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/splitflow',
  JWT_PRIVATE_KEY: loadKey(jwtPrivateKeyPath, 'Clave privada'),
  JWT_PUBLIC_KEY: loadKey(jwtPublicKeyPath, 'Clave pública'),
  JWT_ALGORITHM: 'RS256', // Algoritmo de firma RSA
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '7d',
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS) || 10,

  SEED: {
    ADMIN: {
      EMAIL: process.env.SEED_SCRIPT_ADMIN_EMAIL,
      USERNAME: process.env.SEED_SCRIPT_ADMIN_USERNAME,
      PASSWORD: process.env.SEED_SCRIPT_ADMIN_PASSWORD
    },
    USER: {
      EMAIL: process.env.SEED_SCRIPT_USER_EMAIL,
      USERNAME: process.env.SEED_SCRIPT_USER_USERNAME,
      PASSWORD: process.env.SEED_SCRIPT_USER_PASSWORD
    },
    USERADMIN: {
      EMAIL: process.env.SEED_SCRIPT_USERADMIN_EMAIL,
      USERNAME: process.env.SEED_SCRIPT_USERADMIN_USERNAME,
      PASSWORD: process.env.SEED_SCRIPT_USERADMIN_PASSWORD
    }
  },

  EMAIL: {
    HOST: process.env.EMAIL_HOST,
    PORT: parseInt(process.env.EMAIL_PORT) || 587,
    USER: process.env.EMAIL_USER,
    PASS: process.env.EMAIL_PASS
  },

  FRONTEND_URL: process.env.FRONTEND_URL,

  STORAGE: {
    BUCKET: process.env.STORAGE_BUCKET,
    REGION: process.env.STORAGE_REGION,
    ACCESS_KEY: process.env.STORAGE_ACCESS_KEY,
    SECRET_KEY: process.env.STORAGE_SECRET_KEY
  }
};
