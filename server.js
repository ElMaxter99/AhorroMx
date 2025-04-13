const fs = require('fs');
const http = require('http');
const https = require('https');

const config = require('./config');
const app = require('./src/app');
const { logger } = require('./src/utils/logger');

const {
  APP_NAME,
  APP_VERSION,
  NODE_ENV,
  PORT,
  HTTPS_PORT,
  CERTS
} = config;

const NODE_ENVS = require('./src/enums/constants');

const logStartup = (protocol, port) => {
  logger.info(`🚀 ${APP_NAME} v${APP_VERSION} - ${NODE_ENV.toUpperCase()}`);
  logger.info(`${protocol} server listening on port ${port}`);
};

if (NODE_ENV === NODE_ENVS.PRODUCTION && fs.existsSync(CERTS.KEY_PATH) && fs.existsSync(CERTS.CERT_PATH)) {
  const credentials = {
    key: fs.readFileSync(CERTS.KEY_PATH, 'utf8'),
    cert: fs.readFileSync(CERTS.CERT_PATH, 'utf8')
  };

  https.createServer(credentials, app).listen(HTTPS_PORT, () => {
    logStartup('🔐 HTTPS', HTTPS_PORT);
  });

  // Opcional: HTTP para fallback o redirección
  http.createServer(app).listen(PORT, () => {
    logger.info(`🌐 HTTP fallback server on port ${PORT}`);
  });
} else {
  // Solo HTTP en desarrollo o si faltan certs
  http.createServer(app).listen(PORT, () => {
    logStartup('🌐 HTTP', PORT);
  });
}
