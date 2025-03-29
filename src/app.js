require('dotenv').config();
const express = require('express');

const routes = require('./routes');
const { notFoundHandler, internalErrorHandler } = require('./middlewares/errorHandler');
const connectDB = require('../config/db');

const path = require('path');
const app = express();
app.use(express.json());

connectDB();

// Rutas de la API
app.use('/api', routes);

// Servir archivos estáticos desde la carpeta "public"
app.use('/public', express.static(path.join(__dirname, '../public')));

// 🛑 Middleware para manejar rutas no encontradas
app.use(notFoundHandler);

// 🛑 Middleware para manejar errores internos del servidor
app.use(internalErrorHandler);

module.exports = app;
