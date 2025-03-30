'use strict';

const expenseBll = require('../bll/expense');

exports.createExpense = async (req, res) => {
  try {
    const { user } = req;
    const newExpense = await expenseBll.createExpense(req.body, user);
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el gasto.', details: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const expense = await expenseBll.getExpenseById(req.params.expenseId, req.user, req.query);
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el gasto.', details: error.message });
  }
};

exports.getList = async (req, res) => {
  try {
    const expenseList = await expenseBll.getList(req.query, req.user);
    res.status(200).json(expenseList);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los gastos.', details: error.message });
  }
};

exports.getListByGroup = async (req, res) => {
  try {
    const expenseList = await expenseBll.getListByUser(req.params.userId, req.user, req.query);
    res.status(200).json(expenseList);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los gastos.', details: error.message });
  }
};

exports.getListByUser = async (req, res) => {
  try {
    const expenseList = await expenseBll.getListByGroup(req.params.groupId, req.user, req.query);
    res.status(200).json(expenseList);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los gastos.', details: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updatedExpense = await expenseBll.updateExpense(req.params.expenseId, req.body, req.user);
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el gasto.', details: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    await expenseBll.deleteExpense(req.params.expenseId, req.user);
    res.json({ message: 'Gasto eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el gasto.', details: error.message });
  }
};
