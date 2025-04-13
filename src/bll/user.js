'use strict';

const userRepository = require('../repository/user');

const groupBll = require('./group');
const multiavatarBll = require('./multiavatar');

const { USER_ROLES } = require('../enums/user');
const { DEFAULT_IMG_DIR } = require('../enums/default');

function sanitizeUser (user) {
  if (!user) return null;

  const { password, passwordHistory, profileInfo, ...sanitizedUser } = user.toObject ? user.toObject() : user;
  return sanitizedUser;
}
exports.sanitizeUser = sanitizeUser;

function sanitizeUsers (users) {
  if (!users || users.length === 0) return [];

  return users.map(user => {
    const { password, passwordHistory, profileInfo, ...sanitizedUser } = user.toObject ? user.toObject() : user;
    return sanitizedUser;
  });
}
exports.sanitizeUsers = sanitizeUsers;

function hasAdminRole (user) {
  return user.role.includes(USER_ROLES.ADMIN);
}
exports.hasAdminRole = hasAdminRole;

function hasUserRole (user) {
  return user.role.includes(USER_ROLES.USER);
};
exports.isUser = hasUserRole;

function sameUser (userId, user) {
  return user._id.toString() === userId.toString();
}
exports.sameUser = sameUser;

function isUserActive (user) {
  return user.active;
}
exports.isUserActive = isUserActive;

function isUserBlocked (user) {
  return user.blocked;
}
exports.isUserBlocked = isUserBlocked;

function isUserDeleted (user) {
  return user.deleted;
}
exports.isUserDeleted = isUserDeleted;

function hasRole (user, role) {
  return user.role.includes(role);
}
exports.hasRole = hasRole;

function isSameUser (userOne, userTwo) {
  userOne = userOne._id ? userOne._id.toString() : userOne.toString();
  userTwo = userTwo._id ? userTwo._id.toString() : userTwo.toString();
  return userOne === userTwo;
}
exports.isSameUser = isSameUser;

async function generateDefaultAvatar (userId, options = {}) {
  const customSeed = options.customSeed || userId.toString();
  const multiavatarOptions = { seed: customSeed };
  const { svg, seed } = multiavatarBll.getAvatarSvgWithSeed(multiavatarOptions);
  if (!svg) {
    throw new Error('No se pudo generar el avatar');
  }

  const filepath = await multiavatarBll.saveAvatarToDisk(userId, svg, seed);
  return { filepath, seed };
}
exports.generateDefaultAvatar = generateDefaultAvatar;

async function setProfileImage (userId, imagePath, user) {
  const isAdmin = hasAdminRole(user);
  const sameUser = isSameUser(userId, user._id);

  if (!isAdmin && !sameUser) {
    throw new Error('No tienes permiso para actualizar la imagen de perfil de este usuario.');
  }

  try {
    const result = await userRepository.updateProfilePicture(userId, imagePath);
    return !!result;
  } catch (error) {
    console.error('Error al actualizar la imagen de perfil:', error);
    throw new Error('Hubo un error al actualizar la imagen de perfil.');
  }
}
exports.setProfileImage = setProfileImage;

async function createUser (data, user) {
  if (!data || !user) {
    throw new Error('Datos de usuario o usuario no proporcionados.');
  }

  data.role = data.role || [USER_ROLES.USER];
  data.active = data.active || false;

  const isAdmin = hasAdminRole(user);
  if (!isAdmin && data.role?.includes(USER_ROLES.ADMIN)) {
    throw new Error('No tienes permiso para asignar el rol de administrador.');
  }

  const savedUser = await userRepository.create(data);
  return !!savedUser;
};
exports.createUser = createUser;

async function registerUser (data) {
  if (!data) {
    throw new Error('Datos de usuario no proporcionados.');
  }

  data.role = [USER_ROLES.USER];
  data.active = false;
  data.profileInfo = data.profileInfo || {};
  data.profileInfo.photoUrl = await generateDefaultAvatar(data.multiAvatarSeed) || DEFAULT_IMG_DIR.PROFILE_PIC_DIR;
  data.profileInfo.backgroundUrl = data.profileInfo.backgroundUrl || DEFAULT_IMG_DIR.BACKGROUND_DIR;

  const savedUser = await userRepository.create(data);
  return !!savedUser;
}
exports.register = registerUser;

async function getList (options = {}, user) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  if (!isAdmin) {
    throw new Error('No tienes permiso para ver la lista de usuarios.');
  }

  const users = await userRepository.find(options).select('-password -passwordHistory -__v').lean();
  if (options.noSanitize) {
    return users;
  }

  const usersSanitized = sanitizeUsers(users);
  return usersSanitized;
};
exports.getList = getList;

async function getById (userId, user) {
  const isAdmin = hasAdminRole(user);
  const sameUser = isSameUser(userId, user._id);
  const hasGroupsInCommon = groupBll.hasGroupsInCommon(userId, user._id);

  if (!isAdmin && !sameUser && !hasGroupsInCommon) {
    throw new Error('No tienes permiso para ver este usuario.');
  }

  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      return null;
    }

    return sanitizeUser(user);
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    throw new Error('Hubo un error al obtener el usuario.');
  }
};
exports.getById = getById;

async function getProfile (userId, user) {
  const isAdmin = hasAdminRole(user);
  const sameUser = isSameUser(userId, user._id);
  const hasGroupsInCommon = groupBll.hasGroupsInCommon(userId, user._id);

  if (!isAdmin && !sameUser && !hasGroupsInCommon) {
    throw new Error('No tienes permiso para ver este usuario.');
  }

  try {
    const user = await userRepository.findById(userId).select('-password -passwordHistory -__v').lean();
    if (!user) {
      return null;
    }

    return sanitizeUser(user);
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    throw new Error('Hubo un error al obtener el usuario.');
  }
}
exports.getProfile = getProfile;

async function updateUserRole (userId, newRoles, user) {
  const isAdmin = hasAdminRole(user);
  if (!isAdmin) {
    throw new Error('No tienes permiso para actualizar el rol de este usuario.');
  }

  try {
    const result = await userRepository.updateRoles(userId, newRoles);
    return !!result;
  } catch (error) {
    console.error('Error al actualizar el rol del usuario:', error);
    throw new Error('Hubo un error al actualizar el rol del usuario.');
  }
};
exports.updateUserRole = updateUserRole;

async function addRole (userId, roleName, user) {
  const isAdmin = hasAdminRole(user);
  if (!isAdmin) {
    throw new Error('No tienes permiso para agregar un rol a este usuario.');
  }

  try {
    const result = await userRepository.addRol(userId, roleName);
    return !!result;
  } catch (error) {
    console.error('Error al agregar el rol al usuario:', error);
    throw new Error('Hubo un error al agregar el rol al usuario.');
  }
};
exports.addRole = addRole;

async function removeRole (userId, roleName, user) {
  const isAdmin = hasAdminRole(user);
  if (!isAdmin) {
    throw new Error('No tienes permiso para eliminar un rol de este usuario.');
  }

  try {
    const result = await userRepository.removeRol(userId, roleName);
    return !!result;
  } catch (error) {
    console.error('Error al eliminar el rol del usuario:', error);
    throw new Error('Hubo un error al eliminar el rol del usuario.');
  }
};
exports.removeRole = removeRole;

async function updateUser (userId, data, user) {
  const isAdmin = hasAdminRole(user);

  if (!isAdmin) {
    throw new Error('No tienes permiso para actualizar este usuario.');
  }

  try {
    const result = await userRepository.update(userId, data);
    return !!result;
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    throw new Error('Hubo un error al actualizar el usuario.');
  }
}
exports.update = updateUser;

async function updatePassword (userId, newPlainPassword, user) {
  const isAdmin = hasAdminRole(USER_ROLES.ADMIN);
  const sameUser = isSameUser(userId, user._id);

  if (!isAdmin && !sameUser) {
    throw new Error('No tienes permiso para actualizar la contraseña de este usuario.');
  }

  try {
    const result = await userRepository.updatePassword(userId, newPlainPassword);
    return !!result;
  } catch (error) {
    console.error('Error al actualizar la contraseña del usuario:', error);
    throw new Error('Hubo un error al actualizar la contraseña del usuario.');
  }
};
exports.updatePassword = updatePassword;

async function updateUserEmail (userId, newEmail, user) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const sameUser = isSameUser(userId, user._id);

  if (!isAdmin && !sameUser) {
    throw new Error('No tienes permiso para actualizar el correo electrónico de este usuario.');
  }

  try {
    const result = await userRepository.updateEmail(userId, newEmail);
    return !!result;
  } catch (error) {
    console.error('Error al actualizar el correo electrónico del usuario:', error);
    throw new Error('Hubo un error al actualizar el correo electrónico del usuario.');
  }
};
exports.updateUserEmail = updateUserEmail;

async function updateUserProfileInfo (userId, profileInfo, user) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const sameUser = isSameUser(userId, user._id);

  if (!isAdmin && !sameUser) {
    throw new Error('No tienes permiso para actualizar la información del perfil de este usuario.');
  }

  try {
    const result = await userRepository.updateProfileInfo(userId, profileInfo);
    return !!result;
  } catch (error) {
    console.error('Error al actualizar la información del perfil del usuario:', error);
    throw new Error('Hubo un error al actualizar la información del perfil del usuario.');
  }
};
exports.updateUserProfileInfo = updateUserProfileInfo;

async function updateProfilePicture (userId, profileInfo, user) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const sameUser = isSameUser(userId, user._id);

  if (!isAdmin && !sameUser) {
    throw new Error('No tienes permiso para actualizar la foto de perfil de este usuario.');
  }

  try {
    const result = await userRepository.updateProfilePicture(userId, profileInfo);
    return !!result;
  } catch (error) {
    console.error('Error al actualizar la foto de perfil del usuario:', error);
    throw new Error('Hubo un error al actualizar la foto de perfil del usuario.');
  }
};
exports.updateProfilePicture = updateProfilePicture;

async function activateUser (userId, user) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const sameUser = isSameUser(userId, user._id);
  const userToActivate = await getById(userId);
  const isBlocked = isUserBlocked(userToActivate);

  if (!isAdmin && !sameUser) {
    throw new Error('No tienes permiso para actualizar el estado de este usuario.');
  }

  if (isBlocked && sameUser) {
    throw new Error('No puedes activar tu cuenta si estás bloqueado.');
  }

  try {
    const result = await userRepository.activeUser(userId);
    return !!result;
  } catch (error) {
    console.error('Error al actualizar el estado del usuario:', error);
    throw new Error('Hubo un error al actualizar el estado del usuario.');
  }
};
exports.activateUser = activateUser;

async function deactivateUser (userId, user) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const sameUser = isSameUser(userId, user._id);

  if (!isAdmin && !sameUser) {
    throw new Error('No tienes permiso para actualizar el estado de este usuario.');
  }

  try {
    const result = await userRepository.deactiveUser(userId);
    return !!result;
  } catch (error) {
    console.error('Error al actualizar el estado del usuario:', error);
    throw new Error('Hubo un error al actualizar el estado del usuario.');
  }
};
exports.deactivateUser = deactivateUser;

async function blockUser (userId, user) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);

  if (!isAdmin) {
    throw new Error('No tienes permiso para bloquear a este usuario.');
  }

  try {
    const resultBlockUser = await userRepository.blockUser(userId);
    const resultDeactivateUser = await userRepository.deactiveUser(userId);
    return !!resultBlockUser && !!resultDeactivateUser;
  } catch (error) {
    console.error('Error al bloquear al usuario:', error);
    throw new Error('Hubo un error al bloquear al usuario.');
  }
};
exports.blockUser = blockUser;

async function unblockUser (userId, user) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);

  if (!isAdmin) {
    throw new Error('No tienes permiso para desbloquear a este usuario.');
  }

  try {
    const result = await userRepository.unblockUser(userId);
    return !!result;
  } catch (error) {
    console.error('Error al desbloquear al usuario:', error);
    throw new Error('Hubo un error al desbloquear al usuario.');
  }
};
exports.unblockUser = unblockUser;

async function falseDeleteUser (userId, user) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const sameUser = isSameUser(userId, user._id);

  if (!isAdmin && !sameUser) {
    throw new Error('No tienes permiso para eliminar a este usuario.');
  }

  try {
    const resultDeactivateUser = await userRepository.deactiveUser(userId);
    const result = await userRepository.falseDeleteUser(userId);
    return !!result && !!resultDeactivateUser;
  } catch (error) {
    console.error('Error al eliminar al usuario:', error);
    throw new Error('Hubo un error al eliminar al usuario.');
  }
};
exports.falseDeleteUser = falseDeleteUser;
