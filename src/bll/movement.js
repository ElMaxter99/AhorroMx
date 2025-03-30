'use strict';

const movementRepository = require('../repository/movement');

const { TYPE } = require('../enums/movement');
const { USER_ROLES } = require('../enums/user');

async function createMovement (data, user) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isSameUser = user._id.toString() === data.user.toString();

  if (!isAdmin && !isSameUser) {
    throw new Error('You do not have permission to create this movement.');
  }

  const savedMovement = await movementRepository.createMovement(data);
  return savedMovement;
};
exports.create = createMovement;

async function update (movementId, data, user) {
  const movement = await getById(movementId, user);
  if (!movement) {
    throw new Error('Movement not found.');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isSameUser = user._id.toString() === movement.user.toString();

  if (!isAdmin && !isSameUser) {
    throw new Error('You do not have permission to update this movement.');
  }

  const updatedMovement = await movementRepository.update(movementId, data);
  return updatedMovement;
}
exports.update = update;

async function updateCategory (movementId, categoryId, user) {
  const movement = await getById(movementId, user);
  if (!movement) {
    throw new Error('Movement not found.');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isSameUser = user._id.toString() === movement.user.toString();

  if (!isAdmin && !isSameUser) {
    throw new Error('You do not have permission to update this movement.');
  }

  const updatedMovement = await movementRepository.updateCategory(movementId, categoryId);
  return updatedMovement;
}
exports.updateCategory = updateCategory;

async function updateType (movementId, type, user) {
  const movement = await getById(movementId, user);
  if (!movement) {
    throw new Error('Movement not found.');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isSameUser = user._id.toString() === movement.user.toString();

  if (!isAdmin && !isSameUser) {
    throw new Error('You do not have permission to update this movement.');
  }

  const updatedMovement = await movementRepository.updateType(movementId, type);
  return updatedMovement;
}
exports.updateType = updateType;

async function getById (movementId, user, options = {}) {
  const movement = await movementRepository.getById(movementId, options);
  if (!movement) {
    console.log('Movement not found.');
    return null;
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isSameUser = user._id.toString() === movement.user.toString();

  if (!isAdmin && !isSameUser) {
    throw new Error('You do not have permission to view this movement.');
  }

  return movement;
}
exports.getById = getById;

async function getList (options = {}, user) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  if (!isAdmin) {
    // If not admin, only allow viewing their own movements
    options.user = user._id.toString();
    if (options.type) {
      const requestedTypes = options.type.split(',');
      options.type = requestedTypes.filter(type => Object.values(TYPE).includes(type));
    }

    options.type = options.type || TYPE.split(',');
  }

  const movements = await movementRepository.getList(options);
  return movements;
}
exports.getList = getList;

async function getListByUser (userId, options = {}) {
  const isAdmin = options.user.role.includes(USER_ROLES.ADMIN);
  const isSameUser = options.user._id.toString() === userId.toString();
  if (!isAdmin && !isSameUser) {
    throw new Error('You do not have permission to view these movements.');
  }

  const movements = await movementRepository.getListByUser(userId, options);
  return movements;
}
exports.getListByUser = getListByUser;

async function getListByUserAndCategory (userId, categoryId, options = {}) {
  const isAdmin = options.user.role.includes(USER_ROLES.ADMIN);
  const isSameUser = options.user._id.toString() === userId.toString();
  if (!isAdmin && !isSameUser) {
    throw new Error('You do not have permission to view these movements.');
  }

  const movements = await movementRepository.getListByUserAndCategory(userId, categoryId, options);
  if (!movements) {
    console.log('Movements not found.');
    return null;
  }

  return movements;
}
exports.getListByUserAndCategory = getListByUserAndCategory;

async function deleteMovement (movementId, user) {
  const movement = await getById(movementId, user);
  if (!movement) {
    throw new Error('Movement not found.');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isSameUser = user._id.toString() === movement.user.toString();

  if (!isAdmin && !isSameUser) {
    throw new Error('You do not have permission to delete this movement.');
  }

  return await movementRepository.delete(movementId);
}
exports.delete = deleteMovement;
