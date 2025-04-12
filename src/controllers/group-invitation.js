'use strict';

const groupInvitationBll = require('../bll/group-invitation');

const { STATUS, INVITATION_ACTION_STATUS } = require('../enums/group-invitation');

exports.create = async (req, res) => {
  try {
    const groupInvitation = await groupInvitationBll.create(req.body, req.user);
    res.status(201).json({ message: 'Invitación creada correctamente' }, groupInvitation);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la invitación', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const groupInvitation = await groupInvitationBll.getById(req.params.groupInvitationId, req.user, req.query);
    res.status(200).json(groupInvitation);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la invitación', error: error.message });
  }
};

exports.getList = async (req, res) => {
  try {
    const groupInvitationList = await groupInvitationBll.getList(req.query, req.user);
    res.status(200).json(groupInvitationList);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la lista de invitaciones', error: error.message });
  }
};

exports.getByGroupId = async (req, res) => {
  try {
    const groupInvitations = await groupInvitationBll.getByGroupId(req.params.groupId, req.user, req.query);
    res.status(200).json(groupInvitations);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las invitaciones del grupo', error: error.message });
  }
};

exports.getByInvitedUserId = async (req, res) => {
  try {
    const groupInvitations = await groupInvitationBll.getByInvitedUserId(req.params.invitedUserId, req.user, req.query);
    res.status(200).json(groupInvitations);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las invitaciones del usuario', error: error.message });
  }
};

exports.getByInviterId = async (req, res) => {
  try {
    const groupInvitations = await groupInvitationBll.getByInviterId(req.params.inviterId, req.user, req.query);
    res.status(200).json(groupInvitations);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las invitaciones del invitador', error: error.message });
  }
};

exports.getByStatus = async (req, res) => {
  try {
    const groupInvitations = await groupInvitationBll.getByStatus(req.params.status, req.user, req.query);
    res.status(200).json(groupInvitations);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las invitaciones por estado', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await groupInvitationBll.delete(req.params.groupInvitationId, req.user);
    res.status(200).json({ message: 'Invitación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la invitación', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updatedInvitation = await groupInvitationBll.update(req.params.groupInvitationId, req.body, req.user);
    res.status(200).json({ message: 'Invitación actualizada correctamente', updatedInvitation });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la invitación', error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const updatedInvitation = await groupInvitationBll.updateStatus(req.params.groupInvitationId, req.body.status, req.user);
    res.status(200).json({ message: 'Estado de la invitación actualizado correctamente', updatedInvitation });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estado de la invitación', error: error.message });
  }
};

exports.handleInvitation = async (req, res) => {
  try {
    const { groupInvitationId, status } = req.params;
    const userId = req.user._id;

    let updatedInvitation;
    switch (status.toUpperCase()) {
      case STATUS.ACCEPTED:
        updatedInvitation = await groupInvitationBll.acceptInvitation(groupInvitationId, userId);
        res.status(200).json({ message: 'Invitación aceptada correctamente', updatedInvitation });
        break;
      case STATUS.DECLINED:
        updatedInvitation = await groupInvitationBll.declineInvitation(groupInvitationId, userId);
        res.status(200).json({ message: 'Invitación rechazada correctamente', updatedInvitation });
        break;
      case STATUS.CANCELLED:
        updatedInvitation = await groupInvitationBll.cancelInvitation(groupInvitationId, userId);
        res.status(200).json({ message: 'Invitación cancelada correctamente', updatedInvitation });
        break;
      case STATUS.DELETED:
        updatedInvitation = await groupInvitationBll.deleteStatusInvitation(groupInvitationId, userId);
        res.status(200).json({ message: 'Invitación eliminada correctamente', updatedInvitation });
        break;
      default:
        res.status(400).json({ message: 'Acción inválida.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al procesar la invitación', error: error.message });
  }
};

exports.handleInvitationAction = async (req, res) => {
  try {
    const { groupInvitationId, invitationAction } = req.params;
    let result;

    switch (invitationAction.toUpperCase()) {
      case INVITATION_ACTION_STATUS.SEND_INVITATION:
        result = await groupInvitationBll.sendInvitationEmail(groupInvitationId, req.user);
        res.status(200).json({ message: 'Correo ~ Invitación enviada correctamente', result });
        break;
      case INVITATION_ACTION_STATUS.ACCEPT_INVITATION:
        // result = await groupInvitationBll.sendAcceptInvitation(groupInvitationId, req.user);
        res.status(200).json({ message: 'Correo ~ Invitación aceptada correctamente', result });
        break;
      case INVITATION_ACTION_STATUS.DECLINE_INVITATION:
        // result = await groupInvitationBll.sendDeclineInvitation(groupInvitationId, req.user);
        res.status(200).json({ message: 'Correo ~ Invitación rechazada correctamente', result });
        break;
      default:
        res.status(400).json({ message: 'Correo ~ Acción inválida.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al manejar la acción de la invitación', error: error.message });
  }
};
