'use strict';

const Contribution = require('../models/contribution');

const { parseQueryValues } = require('../utils/repositoryUtils');

function getQueryFromOptions (options = {}) {
  const query = {};
  if (options.user) {
    query.user = parseQueryValues(options.user);
  }

  if (options.expense) {
    query.expense = parseQueryValues(options.expense);
  }

  if (options.status) {
    query.status = parseQueryValues(options.status);
  }

  if (options.amount) {
    query.amount = options.amount;
  }

  if (options.percentage) {
    query.percentage = options.percentage;
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

  if (options.removeExpense) {
    projection.expense = 0;
  }

  if (options.removeUser) {
    projection.user = 0;
  }

  return projection;
}

function getPopulationFromOptions (options = {}) {
  const population = [];
  if (options.populateExpense) {
    population.push({ path: 'expense' });
  }

  if (options.populateUser) {
    population.push({ path: 'user', select: '-credentials' });
  }

  if (options.populateGroup) {
    population.push({
      path: 'expense',
      populate: {
        path: 'group'
      }
    });
  }

  return population;
}

function buildQueryProjectionAndPopulation (options = {}) {
  const query = getQueryFromOptions(options) || {};
  const projection = getProjectionFromOptions(options) || {};
  const population = getPopulationFromOptions(options) || [];

  return { query, projection, population };
}

async function create (contributionData) {
  try {
    const contribution = await Contribution.create(contributionData);
    return contribution;
  } catch (error) {
    throw new Error('Error creating contribution: ' + error.message);
  }
}

async function update (contributionId, contributionData) {
  try {
    if (!contributionId || !contributionData) {
      throw new Error('Invalid input: contributionId and contributionData are required');
    }

    const contribution = await Contribution.findByIdAndUpdate(contributionId, contributionData, { new: true });
    if (!contribution) {
      throw new Error('Contribution not found or no changes made');
    }

    return contribution;
  } catch (error) {
    throw new Error('Error updating contribution: ' + error.message);
  }
}

async function updateStatus (contributionId, status) {
  try {
    if (!contributionId || !status) {
      throw new Error('Invalid input: contributionId and status are required');
    }

    const contribution = await Contribution.findByIdAndUpdate(contributionId, { status }, { new: true });
    if (!contribution) {
      throw new Error('Contribution not found or no changes made');
    }

    return contribution;
  } catch (error) {
    throw new Error('Error updating contribution status: ' + error.message);
  }
}

async function getContribution (options = {}) {
  try {
    const { query, projection, population } = buildQueryProjectionAndPopulation(options);
    const contribution = await Contribution.findOne(query, projection).populate(population);
    if (!contribution) {
      throw new Error('Contribution not found');
    }

    return contribution;
  } catch (error) {
    throw new Error('Error fetching contribution: ' + error.message);
  }
}

async function getById (contributionId, options = {}) {
  try {
    const { projection, population } = buildQueryProjectionAndPopulation(options);
    const contribution = await Contribution.findById(contributionId, projection).populate(population);
    if (!contribution) {
      throw new Error('Contribution not found');
    }
    return contribution;
  } catch (error) {
    throw new Error('Error fetching contribution: ' + error.message);
  }
}

async function getList (options = {}) {
  try {
    const { query, projection, population } = buildQueryProjectionAndPopulation(options);
    const contributions = await Contribution.find(query, projection).populate(population);
    return contributions;
  } catch (error) {
    throw new Error('Error listing contributions: ' + error.message);
  }
}

async function deleteContribution (contributionId) {
  try {
    const result = await Contribution.deleteById(contributionId);
    if (!result) {
      throw new Error('Contribution not found');
    }
    return result;
  } catch (error) {
    throw new Error('Error deleting contribution: ' + error.message);
  }
}

// async function getListByExpense (expenseId, options = {}) {
//   try {
//     const { projection, population } = buildQueryProjectionAndPopulation(options);
//     const contributions = await Contribution.find({ expense: expenseId }, projection).populate(population);
//     return contributions;
//   } catch (error) {
//     throw new Error('Error listing contributions: ' + error.message);
//   }
// }

async function getListByUser (userId, options = {}) {
  try {
    const { projection, population } = buildQueryProjectionAndPopulation(options);

    const contributions = await Contribution.find({ user: userId }, projection).populate(population);
    return contributions;
  } catch (error) {
    throw new Error('Error listing contributions: ' + error.message);
  }
}

async function getListByGroup (groupId, options = {}) {
  try {
    const { projection, population } = buildQueryProjectionAndPopulation(options);
    const contributions = await Contribution.find({ group: groupId }, projection).populate(population);
    return contributions;
  } catch (error) {
    throw new Error('Error listing contributions: ' + error.message);
  }
}

async function getListByUserAndGroup (userId, groupId, options = {}) {
  try {
    const { projection, population } = buildQueryProjectionAndPopulation(options);
    const contributions = await Contribution.find({ user: userId, group: groupId }, projection).populate(population);
    return contributions;
  } catch (error) {
    throw new Error('Error listing contributions: ' + error.message);
  }
}

module.exports = {
  create,
  update,
  updateStatus,
  get: getContribution,
  getById,
  getList,
  delete: deleteContribution,
  // getListByExpense,
  getListByUser,
  getListByGroup,
  getListByUserAndGroup
};
