'use strict';

const Expense = require('../models/expense');

function buildQueryProjectionAndPopulation (options) {
  const query = {};
  const projection = {};
  const population = [];

  if (options.startDate || options.endDate) {
    query.date = {};
    if (options.startDate) {
      query.date.$gte = new Date(options.startDate);
    }
    if (options.endDate) {
      query.date.$lte = new Date(options.endDate);
    }
  }

  if (options.amount) {
    query.amount = options.amount;
  }

  if (options.category) {
    query.category = options.category;
  }

  if (options.removeCategory) {
    projection.category = 0;
  }

  if (options.removePaidBy) {
    projection.paidBy = 0;
  }

  if (options.removeContributions) {
    projection.contributions = 0;
  }

  if (options.removeGroup) {
    projection.group = 0;
  }

  if (options.sortBy) {
    options.sort = { [options.sortBy]: options.sortOrder === 'desc' ? -1 : 1 };
  }

  if (options.populatePaidBy) {
    population.push({ path: 'paidBy' });
  }

  if (options.populateCategory) {
    population.push({ path: 'category' });
  }

  if (options.populateGroup) {
    population.push({ path: 'group' });
  }

  if (options.populateContributions) {
    population.push({ path: 'contributions' });
  }

  return { query, projection, population, options };
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
  getListByGroup
  getExpenseList,
  deleteExpense,
  getExpensesByGroup,
  getExpensesByUser,
  addContribution,
  removeContribution
};
