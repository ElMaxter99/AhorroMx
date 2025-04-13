const winston = require('winston');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const config = require('../../config/index');

const { NODE_ENVS } = require('../enums/constants');

// Crear directorio de logs si no existe
const logDir = path.join(__dirname, '../logs');
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
} catch (err) {
  console.error(`Error al crear directorio de logs: ${err.message}`);
}

// Crear streams para morgan
const createLogStream = (filename) =>
  fs.createWriteStream(path.join(logDir, filename), { flags: 'a' });

const accessLogStream = createLogStream('access.log');
const errorLogStream = createLogStream('error.log');

// 🎨 Colores personalizados para los logs
const levelColors = {
  info: '\x1b[32m', // verde
  warn: '\x1b[33m', // amarillo
  error: '\x1b[31m', // rojo
  debug: '\x1b[36m', // cyan
  default: '\x1b[37m' // blanco
};

// 🎯 Formato para consola y archivos
const customFormat = winston.format.printf(({ timestamp, level, message, stack }) => {
  const color = levelColors[level] || levelColors.default;
  const reset = '\x1b[0m';
  return `${timestamp} ${color}${level.toUpperCase()}${reset}: ${message}${stack ? `\n${stack}` : ''}`;
});

// Logger principal
const logger = winston.createLogger({
  level: config.NODE_ENV === NODE_ENVS.DEV ? 'debug' : 'info', // Establecer el nivel en función del entorno
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  ),
  transports: [
    new winston.transports.Console({
      level: 'debug', // Aseguramos que el nivel de consola reciba desde 'debug' hacia arriba
      format: winston.format.combine(
        winston.format.colorize(), // Coloriza los logs
        winston.format.simple() // Simple, más legible en consola
      )
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error', // Solo errores se van a este archivo
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'access.log'),
      level: 'info', // Los logs de 'info' y superiores
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
});

// Morgan para accesos HTTP
const morganFormat = config.NODE_ENV === NODE_ENVS.PRODUCTION ? 'combined' : 'dev';

// Middleware para loguear todas las solicitudes HTTP
const httpLogger = morgan(morganFormat, {
  skip: (req, res) => res.statusCode >= 400, // Omite logs de errores 4xx y 5xx
  stream: {
    write: (msg) => {
      logger.info(msg.trim()); // Logs de acceso 'info'
      accessLogStream.write(msg);
    }
  }
});

// Middleware para loguear solo errores 4xx y 5xx
const httpErrorLogger = morgan(morganFormat, {
  skip: (req, res) => res.statusCode < 400, // Solo loguea errores
  stream: {
    write: (msg) => {
      logger.error(msg.trim()); // Logs de errores 'error'
      errorLogStream.write(msg);
    }
  }
});

module.exports = { logger, httpLogger, httpErrorLogger };
