const Expense = require("../models/expense");
const Contribution = require("../models/contribution");

/**
 * Calcula los balances de cada usuario en un grupo
 * @param {String} groupId 
 * @returns {Object} { userId: balance }
 */
const calculateDebts = async (groupId) => {
  const balances = {};

  const expenses = await Expense.find({ group: groupId }).populate("payer");
  
  for (const expense of expenses) {
    const payerId = expense.payer._id.toString();
    if (!balances[payerId]) balances[payerId] = 0;
    balances[payerId] += expense.amount;

    const contributions = await Contribution.find({ expense: expense._id });

    for (const contribution of contributions) {
      const userId = contribution.user.toString();
      if (!balances[userId]) balances[userId] = 0;
      balances[userId] -= contribution.amount;
    }
  }

  return balances;
};

/**
 * Simplifica las deudas dentro de un grupo para minimizar transacciones
 * @param {String} groupId 
 * @returns {Array} Lista de pagos optimizados [{ from, to, amount }]
 */
const simplifyDebts = async (groupId) => {
  const balances = await calculateDebts(groupId);

  let creditors = [];
  let debtors = [];

  // Separar acreedores (+) y deudores (-)
  for (const userId in balances) {
    if (balances[userId] > 0) {
      creditors.push({ user: userId, amount: balances[userId] });
    } else if (balances[userId] < 0) {
      debtors.push({ user: userId, amount: Math.abs(balances[userId]) });
    }
  }

  let transactions = [];

  while (debtors.length > 0 && creditors.length > 0) {
    let debtor = debtors[0];
    let creditor = creditors[0];

    let amount = Math.min(debtor.amount, creditor.amount);

    transactions.push({
      from: debtor.user,
      to: creditor.user,
      amount,
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount === 0) {
      debtors.shift();
    }

    if (creditor.amount === 0) {
      creditors.shift();
    }
  }

  return transactions;
};

module.exports = {
    calculateDebts,
    simplifyDebts,
};
