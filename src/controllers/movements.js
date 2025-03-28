const movementModel = require('../models/movement');

/**
 * Obtener todos los movimientos de un usuario
 */
const getMovements = async (req, res) => {
  try {
    const movements = await movementModel.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo movimientos' });
  }
};

/**
 * Crear un nuevo movimiento (ingreso o gasto)
 */
const createMovement = async (req, res) => {
  try {
    const { amount, type, description, category } = req.body;

    if (!amount || !type) {
      return res.status(400).json({ message: 'Monto y tipo son requeridos' });
    }

    const movement = new movementModel({
      amount,
      type,
      description,
      category,
      user: req.user.id
    });

    await movement.save();
    res.status(201).json(movement);
  } catch (error) {
    res.status(500).json({ message: 'Error creando movimiento' });
  }
};

/**
 * Editar un movimiento existente
 */
const updateMovement = async (req, res) => {
  try {
    const { id } = req.params;
    const movement = await movementModel.findById(id);

    if (!movement || movement.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }

    Object.assign(movement, req.body);
    await movement.save();

    res.json(movement);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando movimiento' });
  }
};

/**
 * Eliminar un movimiento
 */
const deleteMovement = async (req, res) => {
  try {
    const { id } = req.params;
    const movement = await movementModel.findById(id);

    if (!movement || movement.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }

    await movement.deleteOne();
    res.json({ message: 'Movimiento eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando movimiento' });
  }
};

module.exports = {
  getMovements,
  createMovement,
  updateMovement,
  deleteMovement
};
