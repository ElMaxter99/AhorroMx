require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const config = require('../config');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const path = require('path');
const app = express();
app.use(express.json());
app.use(errorHandler);

mongoose.connect(config.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Rutas de la API
app.use('/api', routes);

// Servir archivos estáticos desde la carpeta "public"
app.use('/public', express.static(path.join(__dirname, '../public')));

module.exports = app;
