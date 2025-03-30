'use strict';

const categoryBll = require('../bll/category');

exports.create = async (req, res) => {
  try {
    const category = await categoryBll.create(req.body, req.user);
    res.status(201).json({ message: 'Categoría creada correctamente', category });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la categoría', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const category = await categoryBll.getById(req.params.categoryId, req.user);
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la categoría', error: error.message });
  }
};

exports.getList = async (req, res) => {
  try {
    const categories = await categoryBll.getList(req.query, req.user);
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la lista de categorías', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await categoryBll.delete(req.params.categoryId, req.user);
    res.status(200).json({ message: 'Categoría eliminada correctamente' }, result);
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la categoría', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const category = await categoryBll.update(req.params.categoryId, req.body, req.user);
    res.status(200).json({ message: 'Categoría actualizada correctamente', category });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la categoría', error: error.message });
  }
};

exports.updateName = async (req, res) => {
  try {
    const category = await categoryBll.updateName(req.params.categoryId, req.body.name, req.user);
    res.status(200).json({ message: 'Nombre de la categoría actualizado correctamente', category });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el nombre de la categoría', error: error.message });
  }
};

exports.updateDescription = async (req, res) => {
  try {
    const category = await categoryBll.updateDescription(req.params.categoryId, req.body.description, req.user);
    res.status(200).json({ message: 'Descripción de la categoría actualizada correctamente', category });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la descripción de la categoría', error: error.message });
  }
};

exports.updatePathEmojiIcon = async (req, res) => {
  try {
    const category = await categoryBll.updatePathEmojiIcon(req.params.categoryId, req.body.pathEmojiIcon, req.user);
    res.status(200).json({ message: 'Icono de la categoría actualizado correctamente', category });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el icono de la categoría', error: error.message });
  }
};

exports.updateActive = async (req, res) => {
  try {
    const category = await categoryBll.updateActive(req.params.categoryId, req.body.active, req.user);
    res.status(200).json({ message: 'Estado de la categoría actualizado correctamente', category });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estado de la categoría', error: error.message });
  }
};
