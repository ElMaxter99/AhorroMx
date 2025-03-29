'use strict';

const movementBll = require('../bll/movement');

exports.create = async (req, res) => {
  try {
    const movement = await movementBll.create(req.body, req.user);
    res.status(201).json({ message: 'Movimiento creado correctamente', movement });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el movimiento', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const movement = await movementBll.getById(req.params.movementId, req.user, req.query);
    res.status(200).json(movement);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el movimiento', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await movementBll.delete(req.params.movementId, req.user);
    res.status(200).json({ message: 'Movimiento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el movimiento', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const movement = await movementBll.update(req.params.movementId, req.body, req.user);
    res.status(200).json({ message: 'Movimiento actualizado correctamente', movement });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el movimiento', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const movement = await movementBll.updateCategory(req.params.movementId, req.body.categoryId, req.user);
    res.status(200).json({ message: 'Categoría del movimiento actualizada correctamente', movement });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la categoría del movimiento', error: error.message });
  }
};

exports.updateType = async (req, res) => {
  try {
    const movement = await movementBll.updateType(req.params.movementId, req.body.type, req.user);
    res.status(200).json({ message: 'Tipo del movimiento actualizado correctamente', movement });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el tipo del movimiento', error: error.message });
  }
};

exports.getList = async (req, res) => {
  try {
    const movements = await movementBll.getList(req.user, req.query);
    res.status(200).json(movements);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la lista de movimientos', error: error.message });
  }
};

exports.getListByUser = async (req, res) => {
  try {
    const movements = await movementBll.getListByUser(req.params.userId, req.user, req.query);
    res.status(200).json(movements);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la lista de movimientos por usuario', error: error.message });
  }
};

exports.getListByUserAndCategory = async (req, res) => {
  try {
    const movements = await movementBll.getListByUserAndCategory(req.params.userId, req.params.categoryId, req.user, req.query);
    res.status(200).json(movements);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la lista de movimientos por usuario y categoría', error: error.message });
  }
};
