const Contribution = require('../models/contribution');
const Expense = require('../models/expense');

// Crear una nueva contribución
exports.createContribution = async (req, res) => {
  try {
    const { expenseId, userId, amount, percentage } = req.body;

    // Verificar que el gasto existe
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ error: 'El gasto no existe.' });
    }

    // Crear la contribución
    const contribution = new Contribution({ expenseId, userId, amount, percentage });
    await contribution.save();

    // Agregar la contribución al expense
    expense.contributions.push(contribution._id);
    await expense.save();

    res.status(201).json(contribution);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la contribución.', details: error.message });
  }
};

// Obtener contribuciones de un grupo
exports.getContributions = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Buscar todos los gastos del grupo
    const expenses = await Expense.find({ groupId }).populate('contributions');
    if (!expenses.length) {
      return res.status(404).json({ error: 'No hay contribuciones en este grupo.' });
    }

    // Extraer todas las contribuciones
    const contributions = expenses.flatMap(expense => expense.contributions);

    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las contribuciones.', details: error.message });
  }
};

// Actualizar una contribución
exports.updateContribution = async (req, res) => {
  try {
    const { contributionId } = req.params;
    const { amount, percentage } = req.body;

    // Buscar y actualizar la contribución
    const contribution = await Contribution.findByIdAndUpdate(
      contributionId,
      { amount, percentage },
      { new: true, runValidators: true }
    );

    if (!contribution) {
      return res.status(404).json({ error: 'Contribución no encontrada.' });
    }

    res.json(contribution);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la contribución.', details: error.message });
  }
};

// Eliminar una contribución
exports.deleteContribution = async (req, res) => {
  try {
    const { contributionId } = req.params;

    // Buscar y eliminar la contribución
    const contribution = await Contribution.findByIdAndDelete(contributionId);
    if (!contribution) {
      return res.status(404).json({ error: 'Contribución no encontrada.' });
    }

    // Remover la contribución del gasto asociado
    await Expense.findByIdAndUpdate(contribution.expenseId, {
      $pull: { contributions: contributionId }
    });

    res.json({ message: 'Contribución eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la contribución.', details: error.message });
  }
};
