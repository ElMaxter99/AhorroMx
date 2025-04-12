'use strict';

const Expense = require('../models/expense');

const { parseQueryValues } = require('../utils/repositoryUtils');

function getQueryFromOptions (options = {}) {
  const query = {};
  if (options.paidBy) {
    query.paidBy = parseQueryValues(options.paidBy);
  }

  if (options.category) {
    query.category = parseQueryValues(options.category);
  }

  if (options.group) {
    query.group = parseQueryValues(options.group);
  }

  if (options.contributions) {
    query.contributions = parseQueryValues(options.contributions);
  }

  if (options.startDate || options.endDate) {
    query.creationDate = {};
    if (options.startDate) {
      query.creationDate.$gte = new Date(options.startDate);
    }
    if (options.endDate) {
      query.creationDate.$lte = new Date(options.endDate);
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

  if (options.removePaidBy) {
    projection.paidBy = 0;
  }

  if (options.removeCategory) {
    projection.category = 0;
  }

  if (options.removeGroup) {
    projection.group = 0;
  }

  if (options.removeContribution) {
    projection.contributions = 0;
  }

  if (options.removeCreatedBy) {
    projection.createdBy = 0;
  }

  return projection;
}

function getPopulationFromOptions (options = {}) {
  const population = [];
  if (options.populatePaidBy) {
    population.push({ path: 'paidBy', select: '-credentials' });
  }

  if (options.populateCategory) {
    population.push({ path: 'category' });
  }

  if (options.populateGroup) {
    population.push({ path: 'group' });
  }

  if (options.populateContributions) {
    population.push({ path: 'contribution' });
  }

  return population;
}

function buildQueryProjectionAndPopulation (options = {}) {
  const query = getQueryFromOptions(options) || {};
  const projection = getProjectionFromOptions(options) || {};
  const population = getPopulationFromOptions(options) || [];

  return { query, projection, population };
}

async function create (expenseData) {
  try {
    const expense = await Expense.create(expenseData);
    return expense;
  } catch (error) {
    throw new Error('Error creating expense: ' + error.message);
  }
};

async function update (expenseId, expenseData) {
  try {
    if (!expenseId || !expenseData) {
      throw new Error('Invalid input: expenseId and expenseData are required');
    }
    const expense = await Expense.findByIdAndUpdate(expenseId, expenseData, { new: true });
    if (!expense) {
      throw new Error('Expense not found or no changes made');
    }

    return expense;
  } catch (error) {
    throw new Error('Error updating expense: ' + error.message);
  }
}

async function updateCategory (expenseId, categoryId) {
  try {
    if (!expenseId || !categoryId) {
      throw new Error('Invalid input: expenseId and categoryId are required');
    }
    const expense = await Expense.findByIdAndUpdate(expenseId, { category: categoryId }, { new: true });
    if (!expense) {
      throw new Error('Expense not found or no changes made');
    }

    return expense;
  } catch (error) {
    throw new Error('Error updating expense: ' + error.message);
  }
}

async function addContribution (expenseId, contributionId) {
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { $push: { contributions: contributionId } },
      { new: true }
    );

    return updatedExpense;
  } catch (error) {
    throw new Error('Error updating expense: ' + error.message);
  }
}

async function removeContribution (expenseId, contributionId) {
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { $pull: { contributions: contributionId } },
      { new: true }
    );

    return updatedExpense;
  } catch (error) {
    throw new Error('Error updating expense: ' + error.message);
  }
}

async function get (options = {}) {
  const { query, projection, population } = buildQueryProjectionAndPopulation(options);
  try {
    const expenses = await Expense.findOne(query, projection).population(population);
    if (!expenses) {
      throw new Error('No expense found');
    }

    return expenses;
  } catch (error) {
    throw new Error('Error fetching expenses: ' + error.message);
  }
}

async function getById (expenseId, options = {}) {
  const { projection, population } = buildQueryProjectionAndPopulation(options);
  try {
    const expense = await Expense.findById(expenseId, projection).populate(population);
    return expense;
  } catch (error) {
    throw new Error('Error fetching expense: ' + error.message);
  }
}

async function getList (options = {}) {
  const { query, projection, population } = buildQueryProjectionAndPopulation(options);
  try {
    const expenseList = await Expense.find(query, projection).population(population);
    return expenseList;
  } catch (error) {
    throw new Error('Error listing expenses: ' + error.message);
  }
}

async function getListByUserInGroup (userId, options = {}) {
  const { projection, population } = buildQueryProjectionAndPopulation(options);
  try {
    const expenseList = await Expense.find({
      $or: [
        { 'group.members': userId },
        { 'group.admins': userId },
        { 'group.owner': userId }
      ]
    }, projection).populate(population);
    return expenseList;
  } catch (error) {
    throw new Error('Error fetching expenses: ' + error.message);
  }
}

async function getListByGroup (groupId, options = {}) {
  const { projection, population } = buildQueryProjectionAndPopulation(options);
  try {
    const expenseList = await Expense.find({ group: groupId }, projection).populate(population);
    return expenseList;
  } catch (error) {
    throw new Error('Error listing expenses: ' + error.message);
  }
}

async function getListByUser (userId, options = {}) {
  const { projection, population } = buildQueryProjectionAndPopulation(options);
  try {
    const expenseList = await Expense.find({ paidBy: userId }, projection).populate(population);
    return expenseList;
  } catch (error) {
    throw new Error('Error fetching expenses: ' + error.message);
  }
}

async function deleteExpense (expenseId) {
  try {
    const result = await Expense.deleteById(expenseId);
    if (!result) {
      throw new Error('Expense not found');
    }

    return result;
  } catch (error) {
    throw new Error('Error deleting expense: ' + error.message);
  }
}

module.exports = {
  create,
  update,
  updateCategory,
  addContribution,
  removeContribution,
  get,
  getById,
  getList,
  getListByGroup,
  getListByUser,
  getListByUserInGroup,
  detele: deleteExpense
};
