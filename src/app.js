require('dotenv').config();
const express = require('express');
const path = require('path');

const connectDB = require('../config/db');
const routes = require('./routes');
const { notFoundHandler, internalErrorHandler } = require('./middlewares/errorHandler');
const { logger, errorLogger } = require('../config/logger');

const app = express();
app.use(express.json());

connectDB();

// Middleware para registrar accesos y errores
app.use(logger);
app.use(errorLogger); // Esto graba solo errores 4xx/5xx en el archivo de errores

// Rutas de la API
app.use('/api', routes);

// Servir archivos estáticos desde la carpeta "public"
app.use('/public', express.static(path.join(__dirname, '../public')));

// Middleware para manejar rutas no encontradas
app.use(notFoundHandler);

// Middleware para manejar errores internos del servidor
app.use(internalErrorHandler);

module.exports = app;
