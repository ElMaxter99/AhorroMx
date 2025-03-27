'use strict';

const contributionRepository = require('../repository/contribution');
const groupBll = require('./group');
const expenseBll = require('./expense');

const { USER_ROLES } = require('../enums/user');

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

async function getById (contributionId, user, options) {
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

async function getList (options, user) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  if (!isAdmin) {
    const userGroups = await groupBll.getGroupsByUser(user._id);
    const groupIds = userGroups.map(group => group._id);
    let expenses = [];
    for (const groupId of groupIds) {
      const groupExpenses = await expenseBll.getListByGroup(groupId, user);
      expenses = expenses.concat(groupExpenses);
    }
    options.expense = expenses.join(',');
  }

  const contributions = await contributionRepository.getList(options);
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

async function deleteContribution (contributionId, user) {
  const contribution = await getById(contributionId, user);
  if (!contribution) {
    throw new Error('Contribución no encontrada.');
  }

  await contribution.remove();
};
exports.delete = deleteContribution;

async function getListByExpense (expenseId, user, options) {
  const expense = await expenseBll.getExpenseById(expenseId, user);
  if (!expense) {
    throw new Error('El gasto no existe.');
  }

  const contributions = await contributionRepository.getListByExpense(expenseId, options);
  return contributions;
};
exports.getListByExpense = getListByExpense;

exports.getContributionsByUser = async function getContributionsByUser (userId, user, options) {
  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  if (userId !== user._id && !isAdmin) {
    throw new Error('No tienes permiso para ver las contribuciones de otro usuario.');
  }

  const contributions = await contributionRepository.getListByUser(userId, options);
  return contributions;
};

exports.getContributionsByGroup = async function getContributionsByGroup (groupId, user, options) {
  const group = await groupBll.getGroupById(groupId, user);
  if (!group) {
    throw new Error('El grupo no existe.');
  }

  const contributions = await contributionRepository.getListByGroup(groupId, options);
  return contributions;
};

exports.getContributionsByUserAndGroup = async function getContributionsByUserAndGroup (userId, groupId, user, options) {
  const group = await groupBll.getGroupById(groupId, user);
  if (!group) {
    throw new Error('El grupo no existe.');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  if (userId !== user._id && !isAdmin) {
    throw new Error('No tienes permiso para ver las contribuciones de otro usuario.');
  }

  const contributions = await contributionRepository.getListByUserAndGroup(userId, groupId, options);
  return contributions;
};
