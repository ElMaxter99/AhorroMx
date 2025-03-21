'use strict';

const expenseModel = require("../models/expense");
const contributionModel = require("../models/contribution");

const CONTRIBUTION_STATUS = require("../enums/contribution").STATUS;
const USER_ROLES = require("../enums/user").ROLES;

exports.createExpense = async (req, res) => {
  try {
    const { amount, description, categoryId, paidBy, groupId, contributions} = req.body;
    let createdContributions = [];

    const expenseModel = new expenseModel({
      amount: amount,
      description: description,
      category: categoryId || null,
      paidBy: paidBy,
      group: groupId,
    });

    const savedExpense = await expenseModel.save();
    if (contributions && contributions.length) {
      for (const contribution of contributions) {
        const contributionModel = new contributionModel({
          expenseId: savedExpense._id,
          user: contribution.userId,
          amount: contribution.amount,
          percentage: contribution.percentage,
          status: CONTRIBUTION_STATUS.PENDING,
        });
        const savedContribution = await contributionModel.save();
        createdContributions.push(savedContribution._id);
      }
    }

    expenseModel.contributions = createdContributions;
    await expenseModel.save();

    res.status(201).json(expenseModel);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el gasto.", error: error });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const { user } = req;
    const { userIds, populateContributions } = req.query;

    let filter = {};

    if (user.role.includes(USER_ROLES.ADMIN) && userIds) {
      const userIdArray = userIds ? userIds.split(",").map(id => id.trim()) : [];
      filter["paidBy"] = { $in: userIdArray };
    } else {
      filter["paidBy"] = user._id;
    }

    let query = expenseModel.find(filter);

    if (populateContributions && populateContributions === "true") {
      query = query.populate("contributions");
    }

    const expenses = await query.exec();

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los gastos.", details: error.message });
  }
};

exports.getExpenseById = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { user } = req;
    const { populateContributions } = req.query;

    let query = expenseModel.findById(expenseId);
    query.populate("group");

    if (populateContributions === "true") {
      query = query.populate("contributions");
    }

    const expense = await query;

    if (!expense) {
      return res.status(404).json({ error: "Gasto no encontrado." });
    }

    const isAdmin = user.role.includes(USER_ROLES.ADMIN);
    const isMember = expense.group?.members?.includes(user._id);

    if (!isAdmin && !isMember) {
      return res.status(403).json({ error: "No tienes permiso para ver este gasto." });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el gasto.", details: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { amount, description, categoryId, paidBy, groupId} = req.body;

    const expense = await expenseModel.findById(expenseId).populate("group");
    
    if (!expense) {
      return res.status(404).json({ error: "Gasto no encontrado." });
    }

    const isAdmin = user.role.includes(USER_ROLES.ADMIN);
    const isMember = expense.group?.members?.includes(user._id);

    if (!isAdmin && !isMember) {
      return res.status(403).json({ error: "No tienes permiso para actualizar este gasto." });
    }

    if (amount) expense.amount = amount;
    if (description) expense.description = description;
    if (categoryId) expense.category = categoryId;
    if (paidBy) expense.paidBy = paidBy;
    if (groupId) expense.group = groupId

    await expense.save();
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el gasto.", details: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await expenseModel.findByIdAndDelete(expenseId);
    if (!expense) {
      return res.status(404).json({ error: "Gasto no encontrado." });
    }

    // Eliminar sus contribuciones asociadas
    await contributionModel.deleteMany({ expenseId });

    res.json({ message: "Gasto eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el gasto.", details: error.message });
  }
};

