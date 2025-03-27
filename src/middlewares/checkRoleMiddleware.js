exports.checkRole = (requiredRoles = []) => {
  return (req, res, next) => {
    try {
      // Asegurar que el usuario esté autenticado
      if (!req.user || !req.user.role) {
        return res.status(403).json({ error: 'Acceso denegado.' });
      }

      const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];

      // Verificar si el usuario tiene al menos uno de los roles requeridos
      const hasRole = requiredRoles.some((role) => userRoles.includes(role));
      if (!hasRole) {
        return res.status(403).json({ error: 'No tienes permiso para acceder a este recurso.' });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Error en la verificación de permisos.' });
    }
  };
};
