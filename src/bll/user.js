'use strict';

const userModel = require("../models/user");

const { USER_ROLES } = require("../enums/user");

function sanitizeUser(user) {
  if (!user) return null;

  const { username, password, passwordHistory, email, profileInfo, ...sanitizedUser } = user.toObject ? user.toObject() : user;
  return sanitizedUser;
}

exports.createUser = async function createUser(data, user) {
  if (!user.role.includes(USER_ROLES.ADMIN)) {
    throw new Error("No tienes permiso para crear un usuario.");
  }

  const newUser = new userModel(data);
  try {
    const savedUser = await newUser.save();
    return savedUser;
  } catch (error) {
    console.error("Error al guardar el usuario:", error);
    throw new Error("Hubo un error al guardar el usuario.");
  }
};

exports.getUserById = async function getUserById(userId, user) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isSameUser = user._id === userId;

  if (!isAdmin && !isSameUser) {
    throw new Error("No tienes permiso para ver este usuario.");
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    throw new Error("Hubo un error al obtener el usuario.");
  }
};

exports.updateUserRole = async function updateUserRole(userId, newRole, user) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);

  if (!isAdmin) {
    throw new Error("No tienes permiso para actualizar el rol de este usuario.");
  }

  try {
    const updatedUser = await userModel.findByIdAndUpdate(userId, { role: newRole }, { new: true });
    if (!updatedUser) {
      throw new Error("Usuario no encontrado.");
    }

    return updatedUser;
  } catch (error) {
    console.error("Error al actualizar el rol del usuario:", error);
    throw new Error("Hubo un error al actualizar el rol del usuario.");
  }
};

exports.updateUserPassword = async function updateUserPassword(userId, newPassword, user) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isSameUser = user._id === userId;

  if (!isAdmin && !isSameUser) {
    throw new Error("No tienes permiso para actualizar la contraseña de este usuario.");
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("Usuario no encontrado.");
    }

    const passwordHistory = user.passwordHistory || [];
    passwordHistory.push(user.password);
    

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { 
        password: newPassword,
        passwordHistory,
        passwordChangedAt: Date.now(),
      },
      { new: true }
    );
    if (!updatedUser) {
      throw new Error("Usuario no encontrado.");
    }

    return updatedUser;
  } catch (error) {
    console.error("Error al actualizar la contraseña del usuario:", error);
    throw new Error("Hubo un error al actualizar la contraseña del usuario.");
  }
};

exports.updateUserEmail = async function updateUserEmail(userId, newEmail, user) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isSameUser = user._id === userId;

  if (!isAdmin && !isSameUser) {
    throw new Error("No tienes permiso para actualizar el correo electrónico de este usuario.");
  }

  try {
    const updatedUser = await userModel.findByIdAndUpdate(userId, { email: newEmail }, { new: true });
    if (!updatedUser) {
      throw new Error("Usuario no encontrado.");
    }

    return updatedUser;
  } catch (error) {
    console.error("Error al actualizar el correo electrónico del usuario:", error);
    throw new Error("Hubo un error al actualizar el correo electrónico del usuario.");
  }
};

exports.updateUserProfileInfo = async function updateUserProfileInfo(userId, profileInfo, user) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isSameUser = user._id === userId;

  if (!isAdmin && !isSameUser) {
    throw new Error("No tienes permiso para actualizar la información del perfil de este usuario.");
  }

  try {
    const updatedUser = await userModel.findByIdAndUpdate(userId, { profileInfo }, { new: true });
    if (!updatedUser) {
      throw new Error("Usuario no encontrado.");
    }

    return updatedUser;
  } catch (error) {
    console.error("Error al actualizar la información del perfil del usuario:", error);
    throw new Error("Hubo un error al actualizar la información del perfil del usuario.");
  }
};

exports.updateActiveStatus = async function updateActiveStatus(userId, newStatus, user) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);

  if (!isAdmin) {
    throw new Error("No tienes permiso para actualizar el estado de este usuario.");
  }

  try {
    const updatedUser = await userModel.findByIdAndUpdate(userId, { active: newStatus }, { new: true });
    if (!updatedUser) {
      throw new Error("Usuario no encontrado.");
    }

    return updatedUser;
  } catch (error) {
    console.error("Error al actualizar el estado del usuario:", error);
    throw new Error("Hubo un error al actualizar el estado del usuario.");
  }
};

exports.blockUser = async function blockUser(userId, user) {
  return await updateActiveStatus(userId, false, user);
};

exports.unblockUser = async function unblockUser(userId, user) {
  return await updateActiveStatus(userId, true, user);
};

exports.getUserStatus = async function getUserStatus(userId, user) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isSameUser = user._id === userId;

  if (!isAdmin && !isSameUser) {
    throw new Error("No tienes permiso para ver el estado de este usuario.");
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("Usuario no encontrado.");
    }

    return user.active;
  } catch (error) {
    console.error("Error al obtener el estado del usuario:", error);
    throw new Error("Hubo un error al obtener el estado del usuario.");
  }
};