'use strict';

const Movement = require('../models/movement');

async function createMovement (movementData) {
  try {
    const result = await Movement.create(movementData);
    return result;
  } catch (error) {
    throw new Error('Error creating movement: ' + error.message);
  }
}

async function updateMovement (movementId, movementData) {
  try {
    if (!movementId || !movementData) {
      throw new Error('Invalid input: movementId and movementData are required');
    }
    const result = await Movement.findByIdAndUpdate(movementId, movementData, { new: true });
    if (!result) {
      throw new Error('Movement not found or no changes made');
    }
    return result;
  } catch (error) {
    throw new Error('Error updating movement: ' + error.message);
  }
}

async function getMovementById (movementId) {
  try {
    const movement = await Movement.findById(movementId);
    if (!movement) {
      throw new Error('Movement not found');
    }
    return movement;
  } catch (error) {
    throw new Error('Error fetching movement: ' + error.message);
  }
}

async function deleteMovement (movementId) {
  try {
    const result = await Movement.deleteById(movementId);
    if (!result) {
      throw new Error('Movement not found');
    }
    return result;
  } catch (error) {
    throw new Error('Error deleting movement: ' + error.message);
  }
}

async function listMovements (filter = {}) {
  try {
    const movements = await Movement.find(filter);
    return movements;
  } catch (error) {
    throw new Error('Error listing movements: ' + error.message);
  }
}

module.exports = {
  createMovement,
  updateMovement,
  getMovementById,
  deleteMovement,
  listMovements
};
