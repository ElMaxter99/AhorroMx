const express = require('express');
const { applyCors } = require('../config/cors');
const path = require('path');

const connectDB = require('../config/db');
const routes = require('./routes');
const { notFoundHandler, internalErrorHandler } = require('./middlewares/errorHandler');
const { httpLogger, httpErrorLogger } = require('./utils/logger');
const config = require('../config/index');

const app = express();
applyCors(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger de acceso antes de las rutas
app.use(httpLogger);

connectDB();

// Rutas de la API
app.use('/api', routes);

app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/files', express.static(config.UPLOADS.DIR));

// Logger de errores después de las rutas
app.use(httpErrorLogger);

// Middlewares de manejo de errores
app.use(notFoundHandler);
app.use(internalErrorHandler);

module.exports = app;
