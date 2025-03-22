'use strict';

const expenseModel = require("../models/expense");
const groupBll = require("./group");
const { USER_ROLES } = require("../enums/user");

exports.createExpense = async function createExpense(data, user) {
	const {
		amount,
		description,
		category,
		paidBy,
		group,
	} = data;

	// Normalizar IDs si se pasan objetos
	const groupId = group && group._id ? group._id : group;
	const paidById = paidBy && paidBy._id ? paidBy._id : paidBy;
	const categoryId = category && category._id ? category._id : category;

	// Verificar que el usuario pertenezca al grupo o sea administrador
	const isAdmin = user && user.role && user.role.includes(USER_ROLES.ADMIN);
	const isMember = await groupBll.validateUserInGroup(user, groupId);

	if (!isAdmin && !isMember) {
		throw new Error("No tienes permiso para agregar gastos a este grupo.");
	}

	const newExpense = new expenseModel({
		amount: amount,
		description: description,
		category: categoryId || null,
		paidBy: paidById,
		group: groupId,
		createdBy: user ? user._id : null,
	});

	try {
		const savedExpense = await newExpense.save();
		return savedExpense;
	} catch (error) {
		console.error("Error al guardar el gasto:", error);
		throw new Error("Hubo un error al guardar el gasto.");
	}
};

exports.getExpenseById = async function getExpenseById(expenseId, user, options = {}) {
	const { populateContributions } = options;

	let query = expenseModel.findById(expenseId);
	query.populate("group");

	if (populateContributions === "true") {
		query = query.populate("contributions");
	}

	try {
		const expense = await query;

		if (!expense) {
			throw new Error("Gasto no encontrado.");
		}

		const isAdmin = user.role.includes(USER_ROLES.ADMIN);
		const isMember = expense.group?.members?.includes(user._id);

		if (!isAdmin && !isMember) {
			throw new Error("No tienes permiso para ver este gasto.");
		}

		return expense;
	} catch (error) {
		console.error("Error al obtener el gasto:", error);
		throw new Error("Hubo un error al obtener el gasto.");
	}
};

exports.updateExpense = async function updateExpense(expenseId, data, user) {
	const {
		amount,
		description,
		category,
		paidBy,
		group,
	} = data;

	const expense = await expenseModel.findById(expenseId).populate("group");

	if (!expense) {
		throw new Error("Gasto no encontrado.");
	}

	const isAdmin = user.role.includes(USER_ROLES.ADMIN);
	const isMember = expense.group?.members?.includes(user._id);

	if (!isAdmin && !isMember) {
		throw new Error("No tienes permiso para actualizar este gasto.");
	}

	if (amount) expense.amount = amount;
	if (description) expense.description = description;
	if (category) expense.category = category;
	if (paidBy) expense.paidBy = paidBy;
	if (group) expense.group = group;

	try {
		await expense.save();
	} catch (error) {
		console.error("Error al guardar el gasto:", error);
		throw new Error("Hubo un error al guardar el gasto.");
	}
};

exports.deleteExpense = async function deleteExpense(expenseId, user) {
	const expense = await expenseModel.findById(expenseId);

	if (!expense) {
		throw new Error("Gasto no encontrado.");
	}

	const isAdmin = user.role.includes(USER_ROLES.ADMIN);
	const isMember = expense.group?.members?.includes(user._id);

	if (!isAdmin && !isMember) {
		throw new Error("No tienes permiso para eliminar este gasto.");
	}

	try {
		await expense.delete();
	} catch (error) {
		console.error("Error al eliminar el gasto:", error);
		throw new Error("Hubo un error al eliminar el gasto.");
	}
};

exports.getExpensesByGroup = async function getExpensesByGroup(groupId, user, options = {}) {
	const { populateContributions } = options;

	let query = expenseModel.find({ group: groupId });
	query.populate("group");

	if (populateContributions === "true") {
		query = query.populate("contributions");
	}

	try {
		const expenses = await query;

		if (!expenses) {
			throw new Error("No se encontraron gastos.");
		}

		const isAdmin = user.role.includes(USER_ROLES.ADMIN);
		const isMember = expense.group?.members?.includes(user._id);

		if (!isAdmin && !isMember) {
			throw new Error("No tienes permiso para ver este gasto.");
		}

		return expenses;
	} catch (error) {
		console.error("Error al obtener los gastos:", error);
		throw new Error("Hubo un error al obtener los gastos.");
	}
};

exports.getExpensesByUser = async function getExpensesByUser(userId, user, options = {}) {
	const { populateContributions } = options;

	let query = expenseModel.find({ paidBy: userId });
	query.populate("group");

	if (populateContributions === "true") {
		query = query.populate("contributions");
	}

	try {
		const expenses = await query;

		if (!expenses) {
			throw new Error("No se encontraron gastos.");
		}

		const isAdmin = user.role.includes(USER_ROLES.ADMIN);
		const isMember = expense.group?.members?.includes(user._id);

		if (!isAdmin && !isMember) {
			throw new Error("No tienes permiso para ver este gasto.");
		}

		return expenses;
	} catch (error) {
		console.error("Error al obtener los gastos:", error);
		throw new Error("Hubo un error al obtener los gastos.");
	}
};
