'use strict';

const GroupInvitation = require('../models/groupInvitation');
const Group = require('../models/group');
const User = require('../models/user');

const emailService = require('../services/emailService'); // Servicio para enviar correos

const { STATUS } = require('../enums/groupInvitation');

exports.inviteUser = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { invitedUserId } = req.body;
    const invitedBy = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Grupo no encontrado.' });
    }

    const invitedUser = await User.findById(invitedUserId);
    if (!invitedUser) {
      return res.status(404).json({ message: 'Usuario invitado no encontrado.' });
    }

    const existingInvitation = await GroupInvitation.findOne({
      group: groupId,
      invitedUser: invitedUserId,
      status: STATUS.PENDING,
    });

    if (existingInvitation) {
      return res.status(400).json({ message: 'El usuario ya tiene una invitación pendiente.' });
    }

    const invitation = new GroupInvitation({
      group: groupId,
      invitedBy,
      invitedUser: invitedUserId,
    });

    const savedInvitation = await invitation.save();

    await emailService.sendInvitationEmail(invitedUser.email, group.name, savedInvitation._id);

    res.status(201).json({ message: 'Invitación enviada correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar la invitación.', error });
  }
};

exports.respondToInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { status } = req.query;
    const userId = req.user._id;

    const invitation = await GroupInvitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ message: 'Invitación no encontrada.' });
    }

    if (invitation.invitedUser.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para responder a esta invitación.' });
    }

    if (![STATUS.ACCEPTED, STATUS.DECLINED].includes(status)) {
      return res.status(400).json({ message: 'Estado inválido.' });
    }

    invitation.status = status;
    await invitation.save();

    if (status === STATUS.ACCEPTED) {
      await Group.findByIdAndUpdate(invitation.group, {
        $addToSet: { members: userId },
      });

      GroupInvitation.updateMany(
        { invitedUser: userId, group: invitation.group, status: STATUS.PENDING },
        { status: STATUS.ACCEPTED }
      );
    }

    if (status === STATUS.DECLINED) {
      await GroupInvitation.updateMany(
        { invitedUser: userId, group: invitation.group, status: STATUS.PENDING },
        { status: STATUS.DECLINED }
      );
    }

    res.json({ message: `Invitación ${status}.` });
  } catch (error) {
    res.status(500).json({ message: 'Error al procesar la invitación.', error });
  }
};

exports.getUserInvitations = async (req, res) => {
  try {
    const userId = req.user._id;
    const invitations = await GroupInvitation.find({ invitedUser: userId, status: STATUS.PENDING })
      .populate('group', 'name')
      .populate('invitedBy', 'name email');

    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las invitaciones.', error });
  }
};
