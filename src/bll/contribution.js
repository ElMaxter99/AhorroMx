'use strict';

const contributionModel = require('../models/contribution');

const groupBll = require('./group');
const expenseBll = require('./expense');

const { USER_ROLES } = require('../enums/user');

function applyPopulateOptions (query, options) {
  const { populateContributions } = options;

  if (populateContributions === 'true') {
    query = query.populate('contributions');
  }

  return query;
}

exports.createContribution = async function createContribution (data, user) {
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

  const query = new contributionModel(data);
  const savedContribution = await query.save();
  return savedContribution;
};

exports.getContributionById = async function getContributionById (contributionId, user, options) {
  let query = contributionModel.findById(contributionId);
  query = applyPopulateOptions(query, options);

  const contribution = await query;
  if (!contribution) {
    console.log('Contribución no encontrada.');
    return null;
  }

  const expense = contribution.expense?._id ? contribution.expense : await expenseBll.getExpenseById(contribution.expense, user);
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

  return contribution;
};

exports.updateContribution = async function updateContribution (contributionId, data, user) {
  const contribution = await contributionModel.findById(contributionId);
  if (!contribution) {
    throw new Error('Contribución no encontrada.');
  }

  const expense = contribution.expense?._id ? contribution.expense : await expenseBll.getExpenseById(contribution.expense, user);
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

  Object.assign(contribution, data);
  const updatedContribution = await contribution.save();
  return updatedContribution;
};

exports.deleteContribution = async function deleteContribution (contributionId, user) {
  const contribution = await contributionModel.findById(contributionId);
  if (!contribution) {
    throw new Error('Contribución no encontrada.');
  }

  const expense = contribution.expense?._id ? contribution.expense : await expenseBll.getExpenseById(contribution.expense, user);
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

  await contribution.remove();
};

exports.getContributionsByExpense = async function getContributionsByExpense (expenseId, user, options) {
  const expense = await expenseBll.getExpenseById(expenseId, user);
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

  const query = contributionModel.find({ expense: expenseId });
  query = applyPopulateOptions(query, options);

  const contributions = await query;
  return contributions;
};

exports.getContributionsByUser = async function getContributionsByUser (userId, user, options) {
  const query = contributionModel.find({ user: userId });
  query = applyPopulateOptions(query, options);

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  if (userId !== user._id && !isAdmin) {
    throw new Error('No tienes permiso para ver las contribuciones de otro usuario.');
  }

  const contributions = await query;
  return contributions;
};

exports.getContributionsByGroup = async function getContributionsByGroup (groupId, user, options) {
  const group = await groupBll.getGroupById(groupId);
  if (!group) {
    throw new Error('El grupo no existe.');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isMember = group.members.includes(user._id);
  if (!isMember && !isAdmin) {
    throw new Error('No eres miembro de este grupo.');
  }

  const query = contributionModel.find({ group: groupId });
  query = applyPopulateOptions(query, options);

  const contributions = await query;
  return contributions;
};

exports.getContributionsByUserAndGroup = async function getContributionsByUserAndGroup (userId, groupId, user, options) {
  const group = await groupBll.getGroupById(groupId);
  if (!group) {
    throw new Error('El grupo no existe.');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isMember = group.members.includes(user._id);
  if (!isMember && !isAdmin) {
    throw new Error('No eres miembro de este grupo.');
  }

  const query = contributionModel.find({ user: userId, group: groupId });
  query = applyPopulateOptions(query, options);

  const contributions = await query;
  return contributions;
};

exports.getContributionsByExpenseAndGroup = async function getContributionsByExpenseAndGroup (expenseId, groupId, user, options) {
  const expense = await expenseBll.getExpenseById(expenseId, user);
  if (!expense) {
    throw new Error('El gasto no existe.');
  }

  const group = await groupBll.getGroupById(groupId);
  if (!group) {
    throw new Error('El grupo no existe.');
  }

  const isAdmin = user.role.includes(USER_ROLES.ADMIN);
  const isMember = group.members.includes(user._id);
  if (!isMember && !isAdmin) {
    throw new Error('No eres miembro de este grupo.');
  }

  const query = contributionModel.find({ expense: expenseId, group: groupId });
  query = applyPopulateOptions(query, options);

  const contributions = await query;
  return contributions;
};
