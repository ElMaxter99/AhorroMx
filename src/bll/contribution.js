'use strict';

const contributionRepository = require('../repository/contribution');

const groupBll = require('./group');
const expenseBll = require('./expense');

const { USER_ROLES } = require('../enums/user');
const { STATUS } = require('../enums/contribution');

// function applyPopulateOptions (query, options) {
//   const { populateContributions } = options;

//   if (populateContributions === 'true') {
//     query = query.populate('contributions');
//   }

//   return query;
// }

async function createContribution (data, user) {
  const expense = data.expense?._id ? data.expense : await expenseBll.getExpenseById(data.expense, user);
  if (!expense) {
    throw new Error('El gasto no existe.');
  }

  const group = await groupBll.getGroupById(expense);
  if (!group) {
    throw new Error('El grupo no existe.');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isMember = group.members.includes(user._id);
  if (!isMember && !isAdmin) {
    throw new Error('No eres miembro de este grupo.');
  }

  const savedContribution = await contributionRepository.createContribution(data);
  return savedContribution;
};
exports.createContribution = createContribution;

async function getById (contributionId, user, options = {}) {
  options.populateExpense = 'true';
  options.populateGroup = 'true';

  const contribution = await contributionRepository.getById(contributionId, options);
  if (!contribution) {
    console.log('Contribución no encontrada.');
    return null;
  }

  const expense = contribution.expense || null;
  if (!expense) {
    throw new Error('El gasto no existe.');
  }

  const group = expense.group || null;
  if (!group) {
    throw new Error('El grupo no existe.');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isMember = group.members.includes(user._id);
  if (!isMember && !isAdmin) {
    throw new Error('No eres miembro de este grupo.');
  }

  return contribution;
};
exports.getById = getById;

async function getList (options = {}, user) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  if (!isAdmin) {
    const userGroups = await groupBll.getGroupsByUser(user._id, user);
    const groupIds = userGroups.map(group => group._id) || [];
    let expenseList = [];
    for (const groupId of groupIds) {
      const expensesFromGroup = await expenseBll.getListByGroup(groupId, user);
      expenseList = expenseList.concat(expensesFromGroup);
    }

    if (options.group) {
      const requestedGroups = options.group.split(',');
      options.group = requestedGroups.filter(groupId => groupIds.includes(groupId)).join(',');
    }

    options.group = options.group || groupIds.join(',');
    if (options.expense) {
      const requestedExpenses = options.expense.split(',');
      const expenseIds = expenseList.map(expense => expense._id);
      options.expense = requestedExpenses.filter(expenseId => expenseIds.includes(expenseId)).join(',');
    }

    options.expense = options.expense || expenseList.map(expense => expense._id).join(',');
    if (options.status) {
      const requestedStatuses = options.status.split(',');
      options.status = requestedStatuses.filter(status => STATUS.includes(status)).join(',');
    }

    options.status = options.status || STATUS.join(',');
    if (options.creationDate) {
      const creationDate = new Date(options.creationDate);
      options.startDate = new Date(creationDate.setHours(0, 0, 0, 0));
      options.endDate = new Date(creationDate.setHours(23, 59, 59, 999));
    }
  }

  const contributions = await contributionRepository.getList(options) || [];
  return contributions;
}
exports.getList = getList;

async function update (contributionId, newData, user) {
  const contribution = await getById(contributionId, user);
  const newContribution = { ...contribution, ...newData };
  const updatedContribution = await contributionRepository.update(contributionId, newContribution);
  return updatedContribution;
};
exports.update = update;

async function updateStatus (contributionId, status, user) {
  const contribution = await getById(contributionId, user);
  if (!contribution) {
    throw new Error('Contribución no encontrada.');
  }

  if (!STATUS.includes(status)) {
    throw new Error('Estado inválido.');
  }

  const updatedContribution = await contributionRepository.updateStatus(contributionId, status);
  return updatedContribution;
}
exports.updateStatus = updateStatus;

async function deleteContribution (contributionId, user) {
  const contribution = await getById(contributionId, user);
  if (!contribution) {
    throw new Error('Contribución no encontrada.');
  }

  await contribution.remove();
};
exports.delete = deleteContribution;

async function getListByExpense (expenseId, user, options = {}) {
  options.expense = expenseId;
  const contributions = await getList(options, user);

  return contributions;
};
exports.getListByExpense = getListByExpense;

async function getListByUser (userId, user, options = {}) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  if (userId !== user._id && !isAdmin) {
    throw new Error('No tienes permiso para ver las contribuciones de otro usuario.');
  }

  options.user = userId;
  const contributions = await getList(options, user);
  return contributions;
};
exports.getListByUser = getListByUser;

async function getListByGroup (groupId, user, options) {
  options.group = groupId;

  const contributions = await getList(options, user);
  return contributions;
};
exports.getListByGroup = getListByGroup;

async function getListByUserAndGroup (userId, groupId, user, options) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  if (userId !== user._id && !isAdmin) {
    throw new Error('No tienes permiso para ver las contribuciones de otro usuario.');
  }

  options.user = userId;
  options.group = groupId;
  const contributions = await getList(options, user);
  return contributions;
};
exports.getListByUserAndGroup = getListByUserAndGroup;
