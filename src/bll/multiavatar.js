const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
const multiavatar = require('@multiavatar/multiavatar');

const config = require('../../config/index');
const { logger } = require('../utils/logger');

const PROFILE_IMAGES_DIR = config.UPLOADS.PROFILE_IMAGES_DIR || path.join(__dirname, '../../uploads/profile');

if (!fs.existsSync(PROFILE_IMAGES_DIR)) {
  fs.mkdirSync(PROFILE_IMAGES_DIR, { recursive: true });
}

/**
 * Genera una semilla aleatoria basada en timestamp si no se proporciona una personalizada.
 * @param {string|null} customSeed
 * @returns {string}
 */
function generateSeed (customSeed = null) {
  if (customSeed) return customSeed;
  return crypto.createHash('md5').update(Date.now().toString()).digest('hex');
}

/**
 * Genera un avatar SVG directamente usando la librería multiavatar.
 * @param {Object} options
 * @param {string} [options.seed] - Semilla personalizada para el avatar.
 * @returns {string|null} - SVG como string.
 */
function getAvatarSvg (options = {}) {
  const seed = generateSeed(options.seed);
  try {
    const svg = multiavatar(seed, {
      format: 'svg',
      size: 250,
      style: 'default'
    });
    return svg;
  } catch (error) {
    logger.error('❌ Error al generar avatar desde multiavatar:', error);
    return null;
  }
}

/**
 * Genera un avatar SVG accediendo a la API remota de multiavatar (por si se quiere usar esa versión).
 * @param {string} seed
 * @returns {Promise<string|null>}
 */
async function fetchAvatarFromApi (seed) {
  const url = `https://api.multiavatar.com/${encodeURIComponent(seed)}`;
  try {
    const response = await axios.get(url, { responseType: 'text' });
    return response.data;
  } catch (error) {
    logger.error('❌ Error al obtener avatar desde la API:', error.message);
    return null;
  }
}

/**
 * Guarda el SVG en disco con el nombre basado en el ID del usuario.
 * @param {string} userId
 * @param {string} svgData
 * @returns {string|null} - Ruta del archivo guardado.
 */
function saveAvatarToDisk (userId, svgData, seed = null) {
  try {
    const filename = `user_${userId}_${seed}_multiavatar.svg`;
    const filepath = path.join(PROFILE_IMAGES_DIR, filename);
    fs.writeFileSync(filepath, svgData, 'utf8');
    return filepath;
  } catch (error) {
    logger.error('❌ Error al guardar avatar en disco:', error.message);
    return null;
  }
}

/**
 * Genera un avatar desde multiavatar y lo guarda en disco.
 * @param {string} userId - ID del usuario.
 * @param {Object} options
 * @param {string} [options.seed] - Semilla personalizada.
 * @param {boolean} [options.useApi=false] - Si se debe usar la API remota. #La API esta capada a peticiones automaticas por cloudflare
 * @returns {Promise<string|null>} - Ruta del archivo guardado.
 */
async function generateAndSaveAvatar (userId, options = {}) {
  const seed = generateSeed(options.seed);
  let svg = options.useApi
    ? await fetchAvatarFromApi(seed)
    : getAvatarSvg({ seed });

  // Si no se pudo obtener el SVG de la API, intenta generarlo localmente
  if (!svg) {
    svg = getAvatarSvg({ seed });
  };

  return saveAvatarToDisk(userId, svg);
}

/**
 * Devuelve el avatar como string SVG (ideal para insertar inline o transformar a stream).
 * @param {Object} options
 * @param {string} [options.seed] - Semilla personalizada.
 * @returns {string|null}
 */
function getAvatarSvgString (options = {}) {
  return getAvatarSvg(options);
}

/**
 * Devuelve el avatar como string SVG y la seed utilizada.
 * @param {Object} options
 * @param {string} [options.seed] - Semilla personalizada.
 * @returns {{ svg: string|null, seed: string }}
 */
function getAvatarSvgWithSeed (options = {}) {
  const seed = generateSeed(options.seed);

  try {
    const svg = multiavatar(seed, {
      format: 'svg',
      size: 250,
      style: 'default'
    });

    return { svg, seed };
  } catch (error) {
    logger.error('❌ Error al generar avatar desde multiavatar:', error);
    return { svg: null, seed };
  }
}

module.exports = {
  generateSeed,
  getAvatarSvgString,
  generateAndSaveAvatar,
  getAvatarSvgWithSeed
};
