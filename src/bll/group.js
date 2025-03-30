'use strict';

const groupRepository = require('../repository/group');

const userBll = require('../bll/user');

const { USER_ROLES } = require('../enums/user');

// exports.getPopulateOptions = function getPopulateOptions (reqQuery) {
//   const options = {
//     populateOwner: reqQuery.populateOwner || 'false',
//     populateAdmins: reqQuery.populateAdmins || 'false',
//     populateMembers: reqQuery.populateMembers || 'false'
//   };
//   return options;
// };

// function applyPopulateOptions (query, options) {
//   const { populateOwner, populateAdmins, populateMembers } = options;

//   if (populateOwner === 'true') {
//     query = query.populate('owner');
//   }

//   if (populateAdmins === 'true') {
//     query = query.populate('admins');
//   }

//   if (populateMembers === 'true') {
//     query = query.populate('members');
//   }

//   return query;
// }

/**
 * Checks if a user is a member, admin, or owner of a specified group.
 *
 * @async
 * @function isUserMemberGroup
 * @param {Object|string} user - The user object or user ID to check.
 * @param {Object|string} group - The group object or group ID to check.
 * @returns {Promise<boolean>} - Returns `true` if the user is a member, admin, or owner of the group, otherwise `false`.
 * @throws {Error} - Throws an error if the group does not exist.
 */
async function isUserInGroup (user, group) {
  if (!group._id) {
    group = await groupRepository.findById(group);
  }

  if (!user._id) {
    user = await userBll.findById(user);
  }

  if (!group || !user) {
    throw new Error('Error al ver si un usuario existe en un grupo');
  }

  const userIsMemberGroup = group.members?.includes(user._id);
  const userIsAdminGroup = group.admins?.includes(user._id);
  const userIsOwnerGroup = group.owner?.toString() === user._id.toString();

  return userIsMemberGroup || userIsAdminGroup || userIsOwnerGroup;
};
exports.isUserInGroup = isUserInGroup;

/**
 * Checks if a user is a member of a specified group.
 *
 * @async
 * @function isUserMemberGroup
 * @param {Object|string} user - The user object or user ID to check.
 * @param {Object|string} group - The group object or group ID to check.
 * @returns {Promise<boolean>} - Returns `true` if the user is a member of the group, otherwise `false`.
 * @throws {Error} - Throws an error if the group does not exist.
 */
async function isUserMemberGroup (user, group) {
  if (!group._id) {
    group = await groupRepository.findById(group);
  }

  if (!user._id) {
    user = await userBll.findById(user);
  }

  if (!group || !user) {
    throw new Error('Error al verificar si un usuario es miembro del grupo.');
  }

  return group.members?.includes(user._id) || false;
}
exports.isUserMemberGroup = isUserMemberGroup;

/**
 * Checks if a user is an admin of a specified group.
 *
 * @async
 * @function isUserAdminGroup
 * @param {Object|string} user - The user object or user ID to check.
 * @param {Object|string} group - The group object or group ID to check.
 * @returns {Promise<boolean>} - Returns `true` if the user is an admin of the group, otherwise `false`.
 * @throws {Error} - Throws an error if the group does not exist.
 */
async function isUserAdminGroup (user, group) {
  if (!group._id) {
    group = await groupRepository.findById(group);
  }

  if (!user._id) {
    user = await userBll.findById(user);
  }

  if (!group || !user) {
    throw new Error('Error al verificar si un usuario es administrador del grupo.');
  }

  return group.admins?.includes(user._id) || false;
}
exports.isUserAdminGroup = isUserAdminGroup;

/**
 * Checks if a user is the owner of a specified group.
 *
 * @async
 * @function isUserOwnerGroup
 * @param {Object|string} user - The user object or user ID to check.
 * @param {Object|string} group - The group object or group ID to check.
 * @returns {Promise<boolean>} - Returns `true` if the user is the owner of the group, otherwise `false`.
 * @throws {Error} - Throws an error if the group does not exist.
 */
async function isUserOwnerGroup (user, group) {
  if (!group._id) {
    group = await groupRepository.findById(group);
  }

  if (!user._id) {
    user = await userBll.findById(user);
  }

  if (!group || !user) {
    throw new Error('Error al verificar si un usuario es propietario del grupo.');
  }

  return group.owner?.toString() === user._id.toString();
}
exports.isUserOwnerGroup = isUserOwnerGroup;

async function create (data, user) {
  data.owner = data.owner || user._id;
  data.members = data.members?.length || [user._id];
  data.admins = data.members?.length || [user._id];
  const savedGroup = await groupRepository.create(data, user);
  return savedGroup;
}
exports.create = create;

async function get (options = {}, user) {
  const group = await groupRepository.get(options);
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isMember = await isUserMemberGroup(user, group);
  if (!isAdmin && !isMember) {
    throw new Error('No tienes permiso para ver este grupo.');
  }

  return group;
}
exports.get = get;

async function getList (options = {}, user) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  if (!isAdmin) {
    // If not admin, only retrieve groups the user belongs to
    options.members = user._id;
  }
  let groups = await groupRepository.getList(options);
  return groups;
}
exports.getList = getList;

async function getById (groupId, user, options) {
  const group = await groupRepository.getById(groupId, options);
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isMember = group ? await isUserMemberGroup(user, group) : false;
  if (!isAdmin && !isMember) {
    throw new Error('No tienes permiso para ver este grupo.');
  }

  return group;
};
exports.getById = getById;

async function getGroupsByUser (userId, user, options = {}) {
  const isAdmin = options.user.role.includes(USER_ROLES.ADMIN);
  const isSameUser = userId.toString() === user._id.toString();
  if (!isAdmin && !isSameUser) {
    throw new Error('You do not have permission to view these groups.');
  }

  const groups = await groupRepository.getListByUser(userId, options);
  return groups;
};
exports.getGroupsByUser = getGroupsByUser;

async function update (groupId, newData, user) {
  const group = getById(groupId, user);
  if (!group) {
    throw new Error('Group dont exist');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isGroupAdmin = await isUserAdminGroup(user, group);
  if (!isGroupAdmin && isAdmin) {
    throw new Error('No tienes permiso para actualizar este grupo.');
  }

  const updatedGroup = await groupRepository.update(groupId, newData);
  return updatedGroup;
}
exports.update = update;

async function deleteGroup (groupId, user) {
  const group = await getById(groupId, user);
  if (!group) {
    throw new Error('Group not found');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isGroupOwner = await isUserOwnerGroup(user, group);
  if (!isGroupOwner && isAdmin) {
    throw new Error('No tienes permiso para actualizar este grupo.');
  }

  return await groupRepository.delete(groupId);
}
exports.delete = deleteGroup;

async function addMember (groupId, userId, user) {
  const group = getById(groupId, user);
  if (!group) {
    throw new Error('El grupo no existe.');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isOwner = await isUserOwnerGroup(user, group);
  const isAdminGroup = await isUserAdminGroup(user, group);
  if (!isAdmin && !isOwner && !isAdminGroup) {
    throw new Error('No tienes permiso para agregar miembros a este grupo.');
  }

  return await groupRepository.addMember(groupId, userId);
};
exports.addMember = addMember;

async function removeMember (groupId, userId, user) {
  const group = getById(groupId, user);
  if (!group) {
    throw new Error('El grupo no existe.');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isOwner = group.owner === user._id;
  const isAdminGroup = group.admins?.includes(user._id);
  const isTargetAdmin = group.admins?.includes(userId);
  const isSelfRemoval = userId === user._id;

  if (userId === group.owner) {
    throw new Error('No puedes remover al propietario del grupo.');
  }

  if (!isOwner && !isSelfRemoval && (!isAdmin && !isAdminGroup)) {
    throw new Error('No tienes permiso para remover miembros de este grupo.');
  }

  if (!isOwner && !isSelfRemoval && isAdminGroup && isTargetAdmin) {
    throw new Error('No puedes remover a otro administrador del grupo.');
  }

  return await groupRepository.removeMember(groupId, userId);
};
exports.removeMember = removeMember;

async function addAdmin (groupId, userId, user) {
  const group = await getById(groupId, user);
  if (!group) {
    throw new Error('El grupo no existe.');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isOwner = group.owner === user._id;
  if (!isAdmin && !isOwner) {
    throw new Error('No tienes permiso para agregar administradores a este grupo.');
  }

  const isMember = await isUserMemberGroup(userId, group);
  if (!isMember) {
    throw new Error('El usuario no es miembro del grupo y no puede ser agregado como administrador.');
  }

  return await groupRepository.addAdmin(groupId, userId);
};
exports.addAdmin = addAdmin;

async function removeAdmin (groupId, userId, user) {
  const group = await getById(groupId, user);
  if (!group) {
    throw new Error('El grupo no existe.');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isOwner = group.owner === user._id;
  if (!isAdmin && !isOwner) {
    throw new Error('No tienes permiso para remover administradores de este grupo.');
  }

  return await groupRepository.removeAdmin(groupId, userId);
};
exports.removeAdmin = removeAdmin;

async function transferGroupOwnership (groupId, newOwnerId, user) {
  const group = await getById(groupId, user);
  if (!group) {
    throw new Error('El grupo no existe.');
  }

  if (group.owner === newOwnerId) {
    throw new Error('El nuevo propietario ya es propietario del grupo.');
  }

  if (!group.members?.includes(newOwnerId)) {
    throw new Error('El nuevo propietario no es miembro del grupo.');
  }

  if (!group.admins?.includes(newOwnerId)) {
    throw new Error('El nuevo propietario no es administrador del grupo.');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isOwner = group.owner === user._id;
  if (!isAdmin && !isOwner) {
    throw new Error('No tienes permiso para transferir la propiedad de este grupo.');
  }

  return await groupRepository.updateOwner(groupId, newOwnerId);
};
exports.transferGroupOwnership = transferGroupOwnership;
