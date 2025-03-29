const funnyMessages = [
  {
    error: '🔥 404 en llamas!',
    message: '¡Oops! Esta ruta se ha derretido. Prueba con otra. 🚒',
    gif: 'https://media.giphy.com/media/rq0m2szJekjnGl4b4F/giphy.gif'
  },
  {
    error: '🦄 Ruta mágica no encontrada',
    message: 'Tal vez necesitas más polvo de hada. 🧚',
    gif: 'https://media.giphy.com/media/M13G8Iq8OHOZG/giphy.gif'
  },
  {
    error: '🚀 404: Perdido en el espacio',
    message: 'La ruta que buscas ha sido absorbida por un agujero negro. 🌌',
    gif: 'https://media.giphy.com/media/14uQ3cOFteDaU/giphy.gif'
  },
  {
    error: '🐱 404: Gato travieso',
    message: 'Un gato se robó esta ruta. 😼',
    gif: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif'
  },
  {
    error: '👾 Error extraterrestre',
    message: 'Esta ruta ha sido secuestrada por alienígenas. 👽',
    gif: 'https://media.giphy.com/media/faQ96sLh7nH5P91OLn/giphy.gif'
  },
  {
    error: '🦋 Vuelo 404 cancelado',
    message: 'Parece que esta ruta se escapó volando. 🦅',
    gif: 'https://media.giphy.com/media/BFN8L8zT2VubbTYXJ8/giphy.gif'
  },
  {
    error: '🐸 404 rana saltarina',
    message: 'La ruta saltó al pantano y no la encontramos. 🐸',
    gif: 'https://media.giphy.com/media/XIuAEM0MY4zKa5pyz1/giphy.gif'
  },
  {
    error: '💡 404 Este NO es el camino',
    message: 'Esta no es la página que estas buscando ... 💡',
    gif: 'https://media.giphy.com/media/VwoJkTfZAUBSU/giphy.gif'
  },
  {
    error: '🧙‍♂️ Ruta mágica extraviada',
    message: 'Un mago se llevó esta ruta y no sabemos dónde la dejó. 🔮',
    gif: 'https://media.giphy.com/media/l1J9qU1HqKFSzqZCU/giphy.gif'
  },
  {
    error: '🎩 404 Sombrero mágico',
    message: 'Este sombrero mágico parece haber hecho desaparecer la ruta. 🎩',
    gif: 'https://media.giphy.com/media/j5B9UldPZPbeY/giphy.gif'
  },
  {
    error: '🌪️ Error torbellino',
    message: 'Un torbellino se llevó la ruta. 🚨',
    gif: 'https://media.giphy.com/media/3o6gE3E0TziuswdcEC/giphy.gif'
  },
  {
    error: '🚢 404 naufragio',
    message: 'La ruta se hundió en el océano. 🌊',
    gif: 'https://media.giphy.com/media/3ohs7rYgDUny64R3Z6/giphy.gif'
  },
  {
    error: '⚡ 404 Rayos y truenos',
    message: 'Parece que un rayo se llevó esta ruta. ⚡',
    gif: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif'
  },
  {
    error: '🌈 404 arcoiris',
    message: 'La ruta se fue a buscar el final del arcoíris. 🌈',
    gif: 'https://media.giphy.com/media/l1J9qU1HqKFSzqZCU/giphy.gif'
  },
  {
    error: '🎮 404 juego fallido',
    message: '¡Esta ruta ha hecho un game over! 🎮',
    gif: 'https://media.giphy.com/media/3ohzq03TAlH6kR1n3q/giphy.gif'
  },
  {
    error: '🏰 404 castillo encantado',
    message: 'La ruta está atrapada en un castillo encantado. 🏰',
    gif: 'https://media.giphy.com/media/9VgV6mJfSv3vG/giphy.gif'
  },
  {
    error: '🍕 404 pizza desaparecida',
    message: 'La pizza se fue... y también la ruta. 🍕',
    gif: 'https://media.giphy.com/media/3o7TKPZdxwLBO2NTF2/giphy.gif'
  },
  {
    error: '💥 404 Big Bang',
    message: '¡Boom! La ruta se dispersó en el universo. 💥',
    gif: 'https://media.giphy.com/media/3o7aD45Xy8qzp6l9B6/giphy.gif'
  },
  {
    error: '⏳ 404 en el tiempo',
    message: 'Parece que viajamos en el tiempo, pero olvidamos la ruta. ⏳',
    gif: 'https://media.giphy.com/media/xT5LMAf5BqYzzQYF8U/giphy.gif'
  }
];

const notFoundHandler = (req, res, next) => {
  const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
  res.status(404).json(randomMessage);
};

const internalErrorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: '💥 500 Error Interno del Servidor',
    message: 'Algo salió mal en el servidor. Por favor, inténtalo de nuevo más tarde o contacta a soporte si el error persiste.',
    gif: 'https://media.giphy.com/media/3o6ZsYm5P38NvUWrDi/giphy.gif'
  });
};

module.exports = {
  notFoundHandler,
  internalErrorHandler
};
