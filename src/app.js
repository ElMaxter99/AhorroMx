const express = require('express');
const path = require('path');

const connectDB = require('../config/db');
const routes = require('./routes');
const { notFoundHandler, internalErrorHandler } = require('./middlewares/errorHandler');
const { httpLogger, httpErrorLogger } = require('./utils/logger');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de morgan para acceso
app.use(httpLogger);

connectDB();

// Rutas de la API
app.use('/api', routes);

// Servir archivos estáticos desde la carpeta "public"
app.use('/public', express.static(path.join(__dirname, '../public')));

// Middleware para errores (si necesitas diferenciar logs)
app.use(httpErrorLogger);

// Middleware para manejar rutas no encontradas
app.use(notFoundHandler);

// Middleware para manejar errores internos del servidor
app.use(internalErrorHandler);

module.exports = app;
