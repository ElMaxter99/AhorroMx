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
	let { amount, description, category, paidBy, group, contributions } = data;
	let createdContributions = [];

	group = group && group._id ? group._id : group;
	paidBy = paidBy && paidBy._id ? paidBy._id : paidBy;
	category = category && category._id ? category._id : category;

	// Verificar que el usuario pertenezca al grupo
	if (await groupBll.validateUserInGroup(paidBy, group)) {
		throw new Error("No tienes permiso para agregar gastos a este grupo.");
	}

	const query = new expenseModel({
		amount: amount,
		description: description,
		category: categoryId || null,
		paidBy: paidBy,
		group: group,
	});

	const savedExpense = await query.save();
	
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

	expense.contributions = contributionDocs;
	await expense.save();

	return expense;
};
