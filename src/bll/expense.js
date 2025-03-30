'use strict';

const expenseRepository = require('../repository/expense');

const groupBll = require('./group');
const userBll = require('./user');

const { USER_ROLES } = require('../enums/user');

async function isExpenseCreatedByUser (expense, user) {
  if (!expense || !user) {
    throw new Error('Expense and user are required.');
  }

  if (!expense._id) {
    expense = await getById(expense);
  }

  if (!user._id) {
    user = await userBll.getById(user);
  }

  return expense.createdBy?.toString() === user._id?.toString();
}

async function createExpense (data, user) {
  data.createdBy = user ? user._id : null;

  const isAdmin = user?.role?.includes(USER_ROLES.ADMIN);
  const isMember = await groupBll.isUserInGroup(user, data.group);

  if (!isAdmin && !isMember) {
    throw new Error('No tienes permiso para agregar gastos a este grupo.');
  }

  const newExpense = await expenseRepository.create(data);
  return newExpense;
};
exports.create = createExpense;

async function getById (expenseId, user, options = {}) {
  const expense = await expenseRepository.getById(expenseId, options);
  if (!expense) {
    return null;
  }

  const isAdmin = user.role?.includes(USER_ROLES.ADMIN);
  const isUserInGroup = groupBll.isUserInGroup(user, expense?.group);
  if (!isAdmin && !isUserInGroup) {
    throw new Error('You do not have permission to view these expense');
  }

  return expense;
};
exports.getById = getById;

async function getList (options = {}, user) {
  const isAdmin = user.role?.includes(USER_ROLES.ADMIN);
  if (!isAdmin) {
    return await expenseRepository.getListByUserInGroup(user._id);
  }

  return await expenseRepository.getList(options);
}
exports.getList = getList;

async function getListByGroup (groupId, user, options = {}) {
  try {
    const isAdmin = user.role?.includes(USER_ROLES.ADMIN);
    const isUserInGroup = await groupBll.isUserInGroup(user, groupId);
    if (!isAdmin && !isUserInGroup) {
      throw new Error('You do not have permission to view these expense');
    }

    const expenseList = await expenseRepository.getListByGroup(groupId, options);
    return expenseList;
  } catch (error) {
    throw new Error('Error listing expenses: ' + error.message);
  }
}
exports.getListByGroup = getListByGroup;

async function getListByUSer (userId, user, options = {}) {
  try {
    const isAdmin = user.role?.includes(USER_ROLES.ADMIN);
    const isSameUser = user._id.toString() === userId.toString();
    if (!isAdmin && !isSameUser) {
      throw new Error('You do not have permission to view these expense');
    }

    const expenseList = await expenseRepository.getListByUser(userId, options);
    return expenseList;
  } catch (error) {
    throw new Error('Error listing expenses: ' + error.message);
  }
}
exports.getListByUser = getListByUSer;

async function updateExpense (expenseId, newData, user) {
  const expense = await expenseRepository.getById(expenseId).populate('group');
  if (!expense) {
    throw new Error('Gasto no encontrado.');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isAdminGroup = await groupBll.isUserAdminGroup(user, expense.group);
  const isExpenseCreator = await isExpenseCreatedByUser(expense, user);

  if (!isAdmin && !isAdminGroup && !isExpenseCreator) {
    throw new Error('No tienes permiso para actualizar este gasto.');
  }

  const updatedExpense = expenseRepository.update(newData);
  return updatedExpense;
};
exports.update = updateExpense;

async function deleteExpense (expenseId, user) {
  const expense = await expenseRepository.getById(expenseId).populate('group');
  if (!expense) {
    throw new Error('Gasto no encontrado.');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isAdminGroup = await groupBll.isUserAdminGroup(user, expense.group);
  const isExpenseCreator = await isExpenseCreatedByUser(expense, user);

  if (!isAdmin && !isAdminGroup && !isExpenseCreator) {
    throw new Error('No tienes permiso para actualizar este gasto.');
  }

  const updatedExpense = expenseRepository.delete(expenseId);
  return updatedExpense;
};
exports.delete = deleteExpense;
