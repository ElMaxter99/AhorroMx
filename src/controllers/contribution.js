'use strict';

const contributionBll = require('../bll/contribution');

const { STATUS } = require('../enums/contribution');

exports.create = async (req, res) => {
  try {
    const contribution = await contributionBll.createContribution(req.body, req.user, req.query);
    res.status(201).json({ message: 'Contribución creada correctamente', contribution });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la contribución', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const contribution = await contributionBll.getById(req.params.contributionId, req.user, req.query);
    res.status(200).json(contribution);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la contribución', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await contributionBll.deleteContribution(req.params.contributionId, req.user);
    res.status(200).json({ message: 'Contribución eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la contribución', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const contribution = await contributionBll.updateContribution(req.params.contributionId, req.body, req.user);
    res.status(200).json({ message: 'Contribución actualizada correctamente', contribution });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la contribución', error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { contributionId } = req.params;
    const { status } = req.body;

    if (!Object.values(STATUS).includes(status)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }

    const updatedContribution = await contributionBll.updateContribution(contributionId, { status }, req.user);
    res.status(200).json({ message: 'Contribución actualizada correctamente', contribution: updatedContribution });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estato de la contribución', error: error.message });
  }
};

exports.getList = async (req, res) => {
  try {
    const contributions = await contributionBll.getList(req.user, req.query);
    res.status(200).json(contributions);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la lista de contribuciones', error: error.message });
  }
};

exports.getListByExpense = async (req, res) => {
  try {
    const contributions = await contributionBll.getListByExpense(req.params.expenseId, req.user, req.query);
    res.status(200).json(contributions);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la lista de contribuciones', error: error.message });
  }
};

exports.getListByUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const contributions = await contributionBll.getListByUser(userId, req.user, req.query);
    res.status(200).json(contributions);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la lista de contribuciones', error: error.message });
  }
};

exports.getListByGroup = async (req, res) => {
  try {
    const contributions = await contributionBll.getListByGroup(req.params.groupId, req.user, req.query);
    res.status(200).json(contributions);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la lista de contribuciones', error: error.message });
  }
};

exports.getListByUserAndGroup = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const contributions = await contributionBll.getListByUserAndGroup(userId, req.params.groupId, req.user, req.query);
    res.status(200).json(contributions);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la lista de contribuciones', error: error.message });
  }
};
