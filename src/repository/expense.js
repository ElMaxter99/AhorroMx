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

async function createExpense (expenseData) {
  try {
    const expense = await Expense.create(expenseData);
    return expense;
  } catch (error) {
    throw new Error('Error creating expense: ' + error.message);
  }
};

async function updateExpense (expenseId, expenseData) {
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

async function getExpense (options = {}) {
  const { query, projection } = buildQueryProjectionAndPopulation(options);
  try {
    const expenses = await Expense.findOne(query, projection);
    if (!expenses) {
      throw new Error('No expense found');
    }

    return expenses;
  } catch (error) {
    throw new Error('Error fetching expenses: ' + error.message);
  }
}

async function getExpenseById (expenseId, options = {}) {
  const { projection, population } = buildQueryProjectionAndPopulation(options);
  try {
    let queryBuilder = await Expense.findById(expenseId, projection);

    population.forEach(populateOption => {
      queryBuilder = queryBuilder.populate(populateOption);
    });

    const expense = await queryBuilder;

    if (!expense) {
      throw new Error('Expense not found');
    }
    return expense;
  } catch (error) {
    throw new Error('Error fetching expense: ' + error.message);
  }
}

async function getExpenseList (options = {}) {
  const { query, projection, population } = buildQueryProjectionAndPopulation(options);
  try {
    let queryBuilder = Expense.find(query, projection);

    population.forEach(populateOption => {
      queryBuilder = queryBuilder.populate(populateOption);
    });

    const expenses = await queryBuilder;
    return expenses;
  } catch (error) {
    throw new Error('Error listing expenses: ' + error.message);
  }
}

async function getListByGroup (groupId, options = {}) {
  const { projection, population } = buildQueryProjectionAndPopulation(options);
  try {
    let queryBuilder = Expense.find({ group: groupId }, projection);

    population.forEach(populateOption => {
      queryBuilder = queryBuilder.populate(populateOption);
    });

    const expenses = await queryBuilder;
    return expenses;
  } catch (error) {
    throw new Error('Error listing expenses: ' + error.message);
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

async function getExpensesByGroup (groupId, options = {}) {
  const { query, projection, population } = buildQueryProjectionAndPopulation(options);
  query.group = groupId;

  try {
    let queryBuilder = Expense.find(query, projection);

    population.forEach(populateOption => {
      queryBuilder = queryBuilder.populate(populateOption);
    });

    const expenses = await queryBuilder;
    return expenses;
  } catch (error) {
    throw new Error('Error fetching expenses: ' + error.message);
  }
}

async function getExpensesByUser (userId, options = {}) {
  const { query, projection, population } = buildQueryProjectionAndPopulation(options);
  query.paidBy = userId;

  try {
    let queryBuilder = Expense.find(query, projection);

    population.forEach(populateOption => {
      queryBuilder = queryBuilder.populate(populateOption);
    });

    const expenses = await queryBuilder;
    return expenses;
  } catch (error) {
    throw new Error('Error fetching expenses: ' + error.message);
  }
}

async function addContribution (expenseId, contributionData) {
  try {
    const expense = await Expense.findByIdAndUpdate(
      expenseId,
      { $push: { contributions: contributionData } },
      { new: true }
    );
    if (!expense) {
      throw new Error('Expense not found');
    }

    return expense;
  } catch (error) {
    throw new Error('Error adding contribution: ' + error.message);
  }
}

async function removeContribution (expenseId, contributionId) {
  try {
    const expense = await Expense.findByIdAndUpdate(
      expenseId,
      { $pull: { contributions: { _id: contributionId } } },
      { new: true }
    );
    if (!expense) {
      throw new Error('Expense not found');
    }

    return expense;
  } catch (error) {
    throw new Error('Error removing contribution: ' + error.message);
  }
}

module.exports = {
  createExpense,
  updateExpense,
  getExpense,
  getExpenseById,
  getListByGroup,
  getExpenseList,
  deleteExpense,
  getExpensesByGroup,
  getExpensesByUser,
  addContribution,
  removeContribution
};
