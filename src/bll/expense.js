'use strict';

const expenseModel = require('../models/expense'); // BORRAR arreglar toda la bll
const expenseRepository = require('../repository/expense');

const groupBll = require('./group');

const { USER_ROLES } = require('../enums/user');

function applyPopulateOptions (query, options) {
  const { populateContributions } = options;

  if (populateContributions === 'true') {
    query = query.populate('contributions');
  }

  return query;
}

exports.createExpense = async function createExpense (data, user) {
  data.createdBy = user ? user._id : null;

  const isAdmin = user && user.role && user.role.includes(USER_ROLES.ADMIN);
  const isMember = await groupBll.validateUserInGroup(user, groupId);

  if (!isAdmin && !isMember) {
    throw new Error('No tienes permiso para agregar gastos a este grupo.');
  }

  const newExpense = new expenseModel(data);
  try {
    const savedExpense = await newExpense.save();
    return savedExpense;
  } catch (error) {
    console.error('Error al guardar el gasto:', error);
    throw new Error('Hubo un error al guardar el gasto.');
  }
};

exports.getExpenseById = async function getExpenseById (expenseId, user, options = {}) {
  let query = expenseModel.findById(expenseId);
  query = applyPopulateOptions(query, options);
  query.populate('group');

  try {
    const expense = await query;
    if (!expense) {
      throw new Error('Gasto no encontrado.');
    }

    const isAdmin = user.role.includes(USER_ROLES.ADMIN);
    const isMember = expense.group?.members?.includes(user._id);

    if (!isAdmin && !isMember) {
      throw new Error('No tienes permiso para ver este gasto.');
    }

    return expense;
  } catch (error) {
    console.error('Error al obtener el gasto:', error);
    throw new Error('Hubo un error al obtener el gasto.');
  }
};

async function getListByGroup (groupId, user, options = {}) {
  try {
    const group = await groupBll.getGroupById(groupId, user);
    if (!group) {
      throw new Error('Grupo no encontrado.');
    }

    const expenseList = await expenseRepository.getListByGroup(options);
    return expenseList;
  } catch (error) {
    throw new Error('Error listing expenses: ' + error.message);
  }
}
exports.getListByGroup = getListByGroup;

exports.updateExpense = async function updateExpense (expenseId, newData, user) {
  const expense = await expenseModel.findById(expenseId).populate('group');
  if (!expense) {
    throw new Error('Gasto no encontrado.');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isMember = expense.group?.members?.includes(user._id);
  if (!isAdmin && !isMember) {
    throw new Error('No tienes permiso para actualizar este gasto.');
  }

  Object.assign(expense, newData);
  try {
    await expense.save();
  } catch (error) {
    console.error('Error al guardar el gasto:', error);
    throw new Error('Hubo un error al guardar el gasto.');
  }
};

exports.deleteExpense = async function deleteExpense (expenseId, user) {
  const expense = await expenseModel.findById(expenseId);
  if (!expense) {
    throw new Error('Gasto no encontrado.');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isMember = expense.group?.members?.includes(user._id);

  if (!isAdmin && !isMember) {
    throw new Error('No tienes permiso para eliminar este gasto.');
  }

  try {
    await expense.delete();
    return expense;
  } catch (error) {
    console.error('Error al eliminar el gasto:', error);
    throw new Error('Hubo un error al eliminar el gasto.');
  }
};

exports.getExpensesByGroup = async function getExpensesByGroup (groupId, user, options = {}) {
  let query = expenseModel.find({ group: groupId });
  query = applyPopulateOptions(query, options);
  query.populate('group');

  try {
    const expenses = await query;
    if (!expenses) {
      throw new Error('No se encontraron gastos.');
    }

    const isAdmin = user.role.includes(USER_ROLES.ADMIN);
    const isMember = expense.group?.members?.includes(user._id);

    if (!isAdmin && !isMember) {
      throw new Error('No tienes permiso para ver este gasto.');
    }

    return expenses;
  } catch (error) {
    console.error('Error al obtener los gastos:', error);
    throw new Error('Hubo un error al obtener los gastos.');
  }
};

exports.getExpensesByUser = async function getExpensesByUser (userId, user, options = {}) {
  let query = expenseModel.find({ paidBy: userId });
  query = applyPopulateOptions(query, options);
  query.populate('group');

  try {
    const expenses = await query;
    if (!expenses) {
      throw new Error('No se encontraron gastos.');
    }

    const isAdmin = user.role.includes(USER_ROLES.ADMIN);
    const isMember = expense.group?.members?.includes(user._id);
    if (!isAdmin && !isMember) {
      throw new Error('No tienes permiso para ver este gasto.');
    }

    return expenses;
  } catch (error) {
    console.error('Error al obtener los gastos:', error);
    throw new Error('Hubo un error al obtener los gastos.');
  }
};
