const User = require('../models/user');
const bcrypt = require('bcryptjs');
const config = require('../../config');

// Obtener perfil del usuario autenticado
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -passwordHistory');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el perfil.', error: error.message });
  }
};

// Actualizar perfil del usuario
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Nombre y correo son obligatorios.' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists && emailExists._id.toString() !== req.user.userId) {
      return res.status(400).json({ message: 'El correo ya está en uso.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password -passwordHistory');

    res.json({ message: 'Perfil actualizado exitosamente.', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar perfil.', error: error.message });
  }
};

// Cambiar contraseña con historial
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(400).json({ message: 'Contraseña actual incorrecta.' });
    }

    // Verificar si la nueva contraseña ya fue usada antes
    if (user.passwordHistory?.length > 0) {
      const isOldPassword = await Promise.all(
        user.passwordHistory.map(async (oldHash) => bcrypt.compare(newPassword, oldHash))
      );

      if (isOldPassword.includes(true)) {
        return res.status(400).json({ message: 'No puedes reutilizar una contraseña anterior.' });
      }
    }

    // Guardar la contraseña actual en el historial (máximo 5 últimas)
    user.passwordHistory = user.passwordHistory || [];
    user.passwordHistory.unshift(user.password);
    if (user.passwordHistory.length > 5) {
      user.passwordHistory.pop();
    }

    // Actualizar la contraseña
    user.password = await bcrypt.hash(newPassword, config.SALT_ROUNDS);
    await user.save();

    res.json({ message: 'Contraseña cambiada con éxito.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar contraseña.', error: error.message });
  }
};

// Configurar preferencias del usuario (Futuro)
exports.updateSettings = async (req, res) => {
  res.json({ message: 'Funcionalidad en desarrollo.' });
};

// Eliminar cuenta
exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.userId);
    res.json({ message: 'Cuenta eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la cuenta.', error: error.message });
  }
};
