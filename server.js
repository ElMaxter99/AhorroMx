const http = require('http');

const config = require('./config');
const app = require('./src/app');
const { logger } = require('./config/logger');

const { APP_NAME, APP_VERSION, NODE_ENV, PORT } = config;

const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`🚀 ${APP_NAME} v${APP_VERSION} - ${NODE_ENV.toUpperCase()}`);
  logger.info(`🎉 ¡El backend está escuchando en el puerto ${PORT}! 🚪🔊`);
});
