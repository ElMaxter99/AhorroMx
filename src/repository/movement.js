'use strict';

const Movement = require('../models/movement');

const { parseQueryValues } = require('../utils/repositoryUtils');

function getQueryFromOptions (options = {}) {
  const query = {};
  if (options.user) {
    query.user = parseQueryValues(options.user);
  }

  if (options.category) {
    query.category = parseQueryValues(options.category);
  }

  if (options.type) {
    query.type = parseQueryValues(options.type);
  }

  if (options.amount) {
    query.amount = options.amount;
  }

  if (options.description) {
    query.description = options.description;
  }

  if (options.startDate || options.endDate) {
    query.date = {};
    if (options.startDate) {
      query.date.$gte = new Date(options.startDate);
    }
    if (options.endDate) {
      query.date.$lte = new Date(options.endDate);
    }
  }

  return query;
}

function getProjectionFromOptions (options = {}) {
  let projection = {};
  if (options.removeTimestamps) {
    projection.creationDate = 0;
    projection.updateDate = 0;
  }

  if (options.removeUser) {
    projection.user = 0;
  }

  if (options.removeCategory) {
    projection.category = 0;
  }

  if (options.removeAmount) {
    projection.amount = 0;
  }

  return projection;
}

function getPopulationFromOptions (options = {}) {
  const population = [];
  if (options.populateCategory) {
    population.push({ path: 'category' });
  }

  if (options.populateUser) {
    population.push({ path: 'user' });
  }

  return population;
}

function buildQueryProjectionAndPopulation (options = {}) {
  const query = getQueryFromOptions(options) || {};
  const projection = getProjectionFromOptions(options) || {};
  const population = getPopulationFromOptions(options) || [];

  return { query, projection, population };
}

async function create (movementData) {
  try {
    const result = await Movement.create(movementData);
    return result;
  } catch (error) {
    throw new Error('Error creating movement: ' + error.message);
  }
}

async function update (movementId, movementData) {
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

async function updateCategory (movementId, categoryId) {
  try {
    if (!movementId || !categoryId) {
      throw new Error('Invalid input: movementId and categoryId are required');
    }

    const movement = await Movement.findByIdAndUpdate(movementId, { category: categoryId }, { new: true });
    if (!movement) {
      throw new Error('Movement not found or no changes made');
    }

    return movement;
  } catch (error) {
    throw new Error('Error updating category to movement: ' + error.message);
  }
}

async function updateType (movementId, type) {
  try {
    if (!movementId || !type) {
      throw new Error('Invalid input: movementId and type are required');
    }

    const movement = await Movement.findByIdAndUpdate(movementId, { type }, { new: true });
    if (!movement) {
      throw new Error('Movement not found or no changes made');
    }

    return movement;
  } catch (error) {
    throw new Error('Error updating type to movement: ' + error.message);
  }
}

async function getMovement (options = {}) {
  try {
    const { query, projection, population } = buildQueryProjectionAndPopulation(options);
    const movement = await Movement.findOne(query, projection).populate(population);
    if (!movement) {
      throw new Error('Movement not found');
    }
    return movement;
  } catch (error) {
    throw new Error('Error fetching movement: ' + error.message);
  }
}

async function getById (movementId, options = {}) {
  try {
    const { projection, population } = buildQueryProjectionAndPopulation(options);
    const movement = await Movement.findById(movementId, projection).populate(population);
    if (!movement) {
      throw new Error('Movement not found');
    }

    return movement;
  } catch (error) {
    throw new Error('Error fetching movement: ' + error.message);
  }
}

async function getList (options = {}) {
  try {
    const { query, projection, population } = buildQueryProjectionAndPopulation(options);
    const movements = await Movement.find(query, projection).populate(population);
    return movements;
  } catch (error) {
    throw new Error('Error fetching movements: ' + error.message);
  }
}

async function deleteMovement (movementId) {
  try {
    if (!movementId) {
      throw new Error('Invalid input: movementId is required');
    }

    const movement = await Movement.findByIdAndDelete(movementId);
    if (!movement) {
      throw new Error('Movement not found or no changes made');
    }

    return movement;
  } catch (error) {
    throw new Error('Error deleting movement: ' + error.message);
  }
}

async function getListByUser (userId, options = {}) {
  try {
    const { projection, population } = buildQueryProjectionAndPopulation(options);
    const movements = await Movement.find({ user: userId }, projection).populate(population);
    return movements;
  } catch (error) {
    throw new Error('Error fetching movements: ' + error.message);
  }
}

async function getListByUserAndCategory (userId, categoryId, options = {}) {
  try {
    const { projection, population } = buildQueryProjectionAndPopulation(options);
    const movements = await Movement.find({ user: userId, category: categoryId }, projection).populate(population);
    return movements;
  } catch (error) {
    throw new Error('Error fetching movements: ' + error.message);
  }
}

module.exports = {
  create,
  update,
  updateCategory,
  updateType,
  getMovement,
  getById,
  getList,
  getListByUser,
  getListByUserAndCategory,
  delete: deleteMovement
};
