'use strict';

const movementModel = require('../models/movement');

const { USER_ROLES } = require('../enums/user');

function applyPopulateOptions (query, options) {
  const { populateCategory, populateUser } = options;

  if (populateCategory === 'true') {
    query = query.populate('category');
  }

  if (populateUser === 'true') {
    query = query.populate('user');
  }

  return query;
}

exports.createMovement = async function createMovement (data, user) {
  const userId = data.user;

  const newMovement = new movementModel(data);

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isSameUser = user._id === userId;

  if (!isAdmin && !isSameUser) {
    throw new Error('No tienes permiso para crear este movimiento.');
  }

  try {
    const savedMovement = await newMovement.save();
    return savedMovement;
  } catch (error) {
    console.error('Error al guardar el movimiento:', error);
    throw new Error('Hubo un error al guardar el movimiento.');
  }
};

exports.getMovementById = async function getMovementById (movementId, user, options) {
  let query = movementModel.findById(movementId);
  query = applyPopulateOptions(query, options);

  try {
    const movement = await query;
    if (!movement) {
      throw new Error('El movimiento no existe.');
    }

    const isAdmin = user.role.includes(USER_ROLES.ADMIN);
    const isSameUser = movement.user._id === user._id;

    if (!isAdmin && !isSameUser) {
      throw new Error('No tienes permiso para ver este movimiento.');
    }

    return movement;
  } catch (error) {
    console.error('Error al obtener el movimiento:', error);
    throw new Error('Hubo un error al obtener el movimiento.');
  }
};

exports.getMovementsByUser = async function getMovementsByUser (userId, user, options) {
  let query = movementModel.find({ user: userId });
  query = applyPopulateOptions(query, options);

  try {
    const movements = await query;

    const isAdmin = user.role.includes(USER_ROLES.ADMIN);
    const isSameUser = user._id === userId;

    if (!isAdmin && !isSameUser) {
      throw new Error('No tienes permiso para ver estos movimientos.');
    }

    return movements;
  } catch (error) {
    console.error('Error al obtener los movimientos:', error);
    throw new Error('Hubo un error al obtener los movimientos.');
  }
};

exports.getMovementsByUserAndType = async function getMovementsByUserAndType (userId, type, user, options) {
  let query = movementModel.find({ user: userId, type });
  query = applyPopulateOptions(query, options);

  try {
    const movements = await query;

    const isAdmin = user.role.includes(USER_ROLES.ADMIN);
    const isSameUser = user._id === userId;

    if (!isAdmin && !isSameUser) {
      throw new Error('No tienes permiso para ver estos movimientos.');
    }

    return movements;
  } catch (error) {
    console.error('Error al obtener los movimientos:', error);
    throw new Error('Hubo un error al obtener los movimientos.');
  }
};

exports.getMovementByUserAndCategory = async function getMovementByUserAndCategory (userId, categoryId, user, options) {
  let query = movementModel.find({ user: userId, category: categoryId });
  query = applyPopulateOptions(query, options);

  try {
    const movements = await query;

    const isAdmin = user.role.includes(USER_ROLES.ADMIN);
    const isSameUser = user._id === userId;

    if (!isAdmin && !isSameUser) {
      throw new Error('No tienes permiso para ver estos movimientos.');
    }

    return movements;
  } catch (error) {
    console.error('Error al obtener los movimientos:', error);
    throw new Error('Hubo un error al obtener los movimientos.');
  }
};

exports.updateMovement = async function updateMovement (movementId, newData, user) {
  const movement = await movementModel.findById(movementId);
  if (!movement) {
    throw new Error('El movimiento no existe.');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isSameUser = movement.user._id === user._id;

  if (!isAdmin && !isSameUser) {
    throw new Error('No tienes permiso para editar este movimiento.');
  }

  Object.assign(movement, newData);
  await movement.save();
  return movement;
};

exports.deleteMovement = async function deleteMovement (movementId, user) {
  const movement = await movementModel.findById(movementId);
  if (!movement) {
    throw new Error('El movimiento no existe.');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isSameUser = movement.user._id === user._id;

  if (!isAdmin && !isSameUser) {
    throw new Error('No tienes permiso para eliminar este movimiento.');
  }

  try {
    await movement.deleteOne();
    return movement;
  } catch (error) {
    console.error('Error al eliminar el movimiento:', error);
    throw new Error('Hubo un error al eliminar el movimiento.');
  }
};
