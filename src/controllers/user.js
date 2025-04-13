'use strict';

const userBll = require('../bll/user');

const config = require('../../config/index');

const { PROFILE_IMAGES_DIR } = config.UPLOADS;

// TODO --> Repasar todos los return de las bll porque devuelvo true y no el objeto y no hace falta q lo ponga en el res.json

exports.create = async (req, res) => {
  try {
    const user = await userBll.create(req.body);
    res.status(201).json({ message: 'Usuario creado correctamente' }, user);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const reposponseRegister = await userBll.register(req.body);
    res.status(201).json({ message: 'Usuario creado correctamente' }, reposponseRegister);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const user = await userBll.getById(req.params.userId, req.user, req.query);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await userBll.getProfile(req.params.userId, req.user, req.query);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el perfil del usuario', error: error.message });
  }
};

exports.getList = async (req, res) => {
  try {
    const userList = await userBll.getList(req.query, req.user);
    res.status(200).json(userList);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la lista de usuarios', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await userBll.delete(req.params.userId, req.user);
    res.status(200).json({ message: 'Usuario borrado correctamente' }, result);
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
  }
};

exports.falseDelete = async (req, res) => {
  try {
    const result = await userBll.falseDelete(req.params.userId, req.user);
    res.status(200).json({ message: 'Usuario borrado correctamente' }, result);
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updatedUser = await userBll.update(req.params.userId, req.body, req.user);
    res.status(200).json({ message: 'Usuario actualizado correctamente' }, updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const updatedUser = await userBll.updatePassword(req.params.userId, req.body.newPlainPassword, req.user);
    res.status(200).json({ message: 'Contraseña actualizada correctamente' }, updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la contraseña', error: error.message });
  }
};

exports.updateEmail = async (req, res) => {
  try {
    const updatedUser = await userBll.updateEmail(req.params.userId, req.body.newEmail, req.user);
    res.status(200).json({ message: 'Email actualizado correctamente' }, updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el email', error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const updatedUser = await userBll.updateStatus(req.params.userId, req.body.newStatus, req.user);
    res.status(200).json({ message: 'Estado actualizado correctamente' }, updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estado', error: error.message });
  }
};

exports.updateRoles = async (req, res) => {
  try {
    const updatedUser = await userBll.updateRole(req.params.userId, req.body.newRoles, req.user);
    res.status(200).json({ message: 'Rol actualizado correctamente' }, updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el rol', error: error.message });
  }
};

exports.addRole = async (req, res) => {
  try {
    const updatedUser = await userBll.addRole(req.params.userId, req.body.newRole, req.user);
    res.status(200).json({ message: 'Rol agregado correctamente' }, updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar el rol', error: error.message });
  }
};

exports.removeRole = async (req, res) => {
  try {
    const updatedUser = await userBll.removeRole(req.params.userId, req.body.newRole, req.user);
    res.status(200).json({ message: 'Rol eliminado correctamente' }, updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el rol', error: error.message });
  }
};

exports.activateUser = async (req, res) => {
  try {
    const updatedUser = await userBll.activateUser(req.params.userId, req.user);
    res.status(200).json({ message: 'Usuario activado correctamente' }, updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al activar el usuario', error: error.message });
  }
};

exports.deactivateUser = async (req, res) => {
  try {
    const updatedUser = await userBll.deactivateUser(req.params.userId, req.user);
    res.status(200).json({ message: 'Usuario desactivado correctamente' }, updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al desactivar el usuario', error: error.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const updatedUser = await userBll.blockUser(req.params.userId, req.user);
    res.status(200).json({ message: 'Usuario bloqueado correctamente' }, updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al bloquear el usuario', error: error.message });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const updatedUser = await userBll.unblockUser(req.params.userId, req.user);
    res.status(200).json({ message: 'Usuario desbloqueado correctamente' }, updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al desbloquear el usuario', error: error.message });
  }
};

// Sube la imagen de perfil
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se envió ninguna imagen' });
    const imagePath = `/${PROFILE_IMAGES_DIR}/${req.file.filename}`;
    const targetUserId = req.body.userId || req.user._id;
    await userBll.setProfileImage(targetUserId, imagePath, req.user);

    res.status(200).json({ success: true, imageUrl: imagePath });
  } catch (err) {
    res.status(500).json({ error: 'Error al subir la imagen de perfil', details: err.message });
  }
};

// TOOD -> Gestion de documentos
// exports.uploadDocument = async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: 'No se envió ningún documento' });

//     const filePath = `/${DOCUMENTS_DIR}/${req.file.filename}`;
//     const targetUserId = req.body.userId || req.user._id;
//     await userBll.setDocument(targetUserId, filePath, req.user);
//     res.status(200).json({ success: true, fileUrl: filePath });
//   } catch (err) {
//     res.status(500).json({ error: 'Error al subir el documento', details: err.message });
//   }
// };
