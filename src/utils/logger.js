const winston = require('winston');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const config = require('../../config/index');

// Crear directorio de logs si no existe
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

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
  level: config.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  ),
  transports: [
    new winston.transports.Console(), // Solo usa customFormat con colores
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10485760,
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'access.log'),
      level: 'info',
      maxsize: 10485760,
      maxFiles: 5
    })
  ]
});

// Morgan para accesos HTTP
const morganFormat = config.NODE_ENV === 'production' ? 'combined' : 'dev';

const httpLogger = morgan(morganFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: {
    write: (msg) => {
      logger.info(msg.trim());
      accessLogStream.write(msg);
    }
  }
});

// Morgan solo para errores 4xx y 5xx
const httpErrorLogger = morgan(morganFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: {
    write: (msg) => {
      logger.error(msg.trim());
      errorLogStream.write(msg);
    }
  }
});

module.exports = { logger, httpLogger, httpErrorLogger };
