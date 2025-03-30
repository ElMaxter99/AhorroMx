'use strict';

const groupBll = require('../bll/group');

exports.create = async (req, res) => {
  try {
    const group = await groupBll.create(req.body, req.user);
    res.status(201).json({ message: 'Grupo creado correctamente' }, group);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el grupo', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const group = await groupBll.getById(req.params.groupId, req.user, req.query);
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el movimiento', error: error.message });
  }
};

exports.getList = async (req, res) => {
  try {
    const groupList = await groupBll.getList(req.query, req.user);
    res.status(200).json(groupList);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la lista de grupos', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await groupBll.delete(req.params.groupId, req.user);
    res.status(200).json({ message: 'Grupo borrado correctamente' }, result);
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el grupo', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updatedGroup = await groupBll.update(req.params.groupId, req.body, req.user);
    res.status(200).json({ message: 'Grupo actualizado correctamente' }, updatedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el grupo', error: error.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { groupId, newMemberId } = req.params;
    const updatedGroup = await groupBll.addMember(groupId, newMemberId, req.user);
    res.status(200).json({ message: 'Agregado miembro al grupo correctamente' }, updatedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar el miembro al el grupo', error: error.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const updatedGroup = await groupBll.removeMember(groupId, memberId, req.user);
    res.status(200).json({ message: 'Eliminado miembro al grupo correctamente' }, updatedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el miembro al el grupo', error: error.message });
  }
};

exports.addAdmin = async (req, res) => {
  try {
    const { groupId, newAdminId } = req.params;
    const updatedGroup = await groupBll.addAdmin(groupId, newAdminId, req.user);
    res.status(200).json({ message: 'Agregado admin al grupo correctamente' }, updatedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar el admin al el grupo', error: error.message });
  }
};

exports.removeAdmin = async (req, res) => {
  try {
    const { groupId, newAdminId } = req.params;
    const updatedGroup = await groupBll.removeAdmin(groupId, newAdminId, req.user);
    res.status(200).json({ message: 'Eliminado admin al grupo correctamente' }, updatedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el admin al el grupo', error: error.message });
  }
};

exports.transferGroupOwnership = async (req, res) => {
  try {
    const { groupId, newOwnerId } = req.params;
    const updatedGroup = await groupBll.transferGroupOwnership(groupId, newOwnerId, req.user);
    res.status(200).json({ message: 'Transferida la propiedad del grupo correctamente' }, updatedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Error al transferir la propiedad  del grupo', error: error.message });
  }
};
