'use strict';
const cors = require('cors');
const config = require('./index');
const { NODE_ENVS } = require('../src/enums/constants');

// Middleware CORS
const corsMiddleware = (req, callback) => {
  const environment = config.NODE_ENV || NODE_ENVS.DEV;

  if (environment === NODE_ENVS.DEV) {
    // En desarrollo, habilitar CORS para todos los orígenes
    callback(null, {
      origin: true, // Permite todos los orígenes
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    });
  } else {
    // En el resto de entornos, restringir a orígenes específicos
    const allowedOrigins = config.ALLOWED_ORIGINS;

    const origin = req.header('Origin');
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, {
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
      });
    } else {
      callback(new Error('No permitido por CORS'));
    }
  }
};

// Función para aplicar CORS globalmente a la app
const applyCors = (app) => {
  app.use(cors(corsMiddleware)); // Aquí aplicas CORS globalmente
};

module.exports = { corsMiddleware, applyCors };
