const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const path = require('path');
const fs = require('fs');

const isProduction = process.env.NODE_ENV === 'production';

// Crear carpeta de logs si no existe
const logDirectory = path.join(__dirname, '../logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Function para generar nombre de archivo con fecha
const getLogFileName = (prefix) => (time, index) => {
  if (!time) return `${prefix}.log`;

  const year = time.getFullYear();
  const month = `${time.getMonth() + 1}`.padStart(2, '0');
  const day = `${time.getDate()}`.padStart(2, '0');

  return `${prefix}-${year}-${month}-${day}.log`;
};

// Streams rotativos
const accessLogStream = rfs.createStream(getLogFileName('access'), {
  interval: '1d',
  path: logDirectory,
  compress: 'gzip'
});

const errorLogStream = rfs.createStream(getLogFileName('error'), {
  interval: '1d',
  path: logDirectory,
  compress: 'gzip'
});

// Logger principal
const logger = isProduction
  ? morgan('combined', { stream: accessLogStream }) // logs normales
  : morgan('dev'); // consola para desarrollo

// Logger sólo para errores (4xx y 5xx)
const errorLogger = morgan('combined', {
  skip: (req, res) => res.statusCode < 400,
  stream: errorLogStream
});

module.exports = {
  logger,
  errorLogger
};
