'use strict';

const Contribution = require("../models/contribution");
const Movement = require("../models/movement");

/**
 * Actualiza la contribución de un usuario en un gasto de grupo.
 */
exports.updateContribution = async (req, res) => {
  try {
    const { contributionId } = req.params;
    const { amount, percentage } = req.body;

    const contribution = await Contribution.findById(contributionId);
    if (!contribution) return res.status(404).json({ message: "Contribución no encontrada" });

    const groupExpense = await GroupExpense.findById(contribution.groupExpense);
    if (!groupExpense) return res.status(404).json({ message: "Gasto de grupo no encontrado" });
    
    // Actualizar contribución
    contribution.amount = amount;
    contribution.percentage = percentage;
    await contribution.save();

    // Ajustar movimiento de deuda si la contribución pertenece a otro usuario
    await Movement.findOneAndUpdate(
      { reference: contribution.groupExpense, user: contribution.user },
      { $set: { amount: -amount, description: `Deuda ajustada por gasto en ${groupExpense.description}` } }
    );

    res.status(200).json({ message: "Contribución actualizada correctamente", contribution });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la contribución", error });
  }
};

/**
 * Marca una contribución como saldada y ajusta la deuda del usuario.
 */
exports.settleContribution = async (req, res) => {
  try {
    const { contributionId } = req.params;
    const contribution = await Contribution.findById(contributionId);
    if (!contribution) return res.status(404).json({ message: "Contribución no encontrada" });

    const groupExpense = await GroupExpense.findById(contribution.groupExpense);
    if (!groupExpense) return res.status(404).json({ message: "Gasto de grupo no encontrado" });

    // Registrar el pago en los movimientos
    await Movement.create({
      user: contribution.user,
      type: "PAYMENT",
      amount: contribution.amount,
      description: `Pago de deuda en ${groupExpense.description}`,
      reference: contribution.groupExpense,
    });

    // Marcar como pagado
    await Contribution.findByIdAndUpdate(contributionId, { settled: true });

    res.status(200).json({ message: "Contribución saldada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al saldar la contribución", error });
  }
};
