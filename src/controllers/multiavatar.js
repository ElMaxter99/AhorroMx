'use strict';

const multiavatarBll = require('../bll/multiavatar');

exports.avatarStreamController = async function avatarStreamController (req, res) {
  const { customSeed } = req.query;
  const { svg, seed } = multiavatarBll.getAvatarSvgWithSeed({ seed: customSeed });

  if (!svg) {
    return res.status(500).json({ error: 'No se pudo generar el avatar' });
  }

  res.setHeader('Content-Type', 'application/json');
  res.json({ seed, svg });
};
