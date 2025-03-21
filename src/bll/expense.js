'use strict';

const expenseModel = require("../models/expense");
//const contributionModel = require("../models/contribution");

const groupBll = require("./group");

const USER_ROLES = require("../enums/user").ROLES;

/**
 * Crea un nuevo gasto
 * @param {Object} data - Datos del gasto a crear
 * @param {Object} user - Usuario que realiza la petición
 */
exports.createExpense = async (data, user) => {
	let {
		amount,
		description, 
		category, 
		paidBy, 
		group, 
	} = data;

	group = group && group._id ? group._id : group;
	paidBy = paidBy && paidBy._id ? paidBy._id : paidBy;
	category = category && category._id ? category._id : category;

	// Verificar que el usuario pertenezca al grupo
	if (user && user.role.include(USER_ROLES.ADMIN)|| await groupBll.validateUserInGroup(user, group)) {
		throw new Error("No tienes permiso para agregar gastos a este grupo.");
	}

	const query = new expenseModel({
		amount: amount,
		description: description,
		category: categoryId || null,
		paidBy: paidBy,
		group: group,
	});

	const savedExpense = await query.save();;

	return savedExpense;
};
