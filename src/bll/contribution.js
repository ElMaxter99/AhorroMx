'use strict';

const contributionModel = require("../models/contribution");

exports.createContribution = async (data) => {
    let { userId, expenseId, amount, percentage } = data;

    const query = new contributionModel({
        expense: expenseId,
        user: userId,
        amount: amount,
        percentage: percentage,
        status: CONTRIBUTION_STATUS.PENDING,
    });
    const savedContribution = await query.save()
    return savedContribution;
};