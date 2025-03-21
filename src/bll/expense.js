'use strict';

const expenseModel = require("../models/expense");
const groupBll = require("./group");
const { USER_ROLES } = require("../enums/user");

exports.createExpense = async (data, user) => {
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
    const isUserInGroup = await groupBll.validateUserInGroup(user, groupId);

    if (!isAdmin && !isUserInGroup) {
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