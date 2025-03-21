'use strict';

const expenseBll = require("../bll/expense");

const CONTRIBUTION_STATUS = require("../enums/contribution").STATUS;
const USER_ROLES = require("../enums/user").ROLES;

exports.createExpense = async (req, res) => {
  try {
    const { user } = req;
    const newExpense = await expenseBll.createExpense(req.body, user, options);
    res.json(newExpense);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el gasto.", details: error.message });
  }
};

exports.getExpenseById = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { user } = req;
    const { populateContributions } = req.query;
    const options = { populateContributions };
    
    const expense = await expenseBll.getExpenseById(expenseId, user, options);

    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el gasto.", details: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { user } = req;
    const updatedExpense = await expenseBll.updateExpense(expenseId, req.body, user);
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el gasto.", details: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { user } = req;
    await expenseBll.deleteExpense(expenseId, user);
    res.json({ message: "Gasto eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el gasto.", details: error.message });
  }
};

exports.getExpenseByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { user } = req;
    const expenses = await expenseBll.getExpenseByGroup(groupId, user);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los gastos.", details: error.message });
  }
};

exports.getExpensesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { user } = req;
    const expenses = await expenseBll.getExpensesByUser(userId, user);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los gastos.", details: error.message });
  }
};