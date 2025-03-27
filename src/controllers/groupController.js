'use strict';

const groupBll = require('../bll/group');
const { simplifyDebts } = require('../services/debtService');

const { ROLES } = require('../enums/user.js');

exports.createGroup = async (req, res) => {
  try {
    const user = req.user;
    const newGroup = groupBll.createGroup(req.body, user);

    res.status(201).json({ message: 'Grupo creado con éxito', newGroup });
  } catch (error) {
    res.status(400).json({ message: 'Error al crear grupo', error });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const userGroupId = req.query.userGroupId || req.user._id;
    const options = groupBll.getPopulateOptions(req.query);
    const user = req.user;
    const groups = await groupBll.getGroups(userGroupId, user, options);

    res.status(200).json({
      groups
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener grupos', error });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;
    const options = groupBll.getPopulateOptions(req.query);
    const group = await Group.findById(groupId, user, options);
    res.status(200).json({ group });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener grupo', error });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await groupBll.findById(groupId, req.body, user);

    if (!group) {
      return res.status(404).json({ message: 'Grupo no encontrado' });
    }

    if (!group.admins.includes(req.user.id) && group.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permisos para actualizar este grupo' });
    }

    if (name) group.name = name;
    if (description) group.description = description;
    if (photoUrl) group.photoUrl = photoUrl;
    if (members) group.members = members;
    if (admins) group.admins = admins;

    await group.save();
    res.status(200).json({ message: 'Grupo actualizado correctamente', group });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el grupo', error });
  }
};

exports.getGroupsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const groups = await Group.find({ members: userId });

    res.status(200).json({ groups });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener grupos', error });
  }
};

exports.getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId)
      .populate('members', 'username email')
      .populate('admins', 'username email');

    if (!group) {
      return res.status(404).json({ message: 'Grupo no encontrado' });
    }

    res.status(200).json({ group });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener detalles del grupo', error });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    const group = await Group.findById(groupId);

    if (!group) return res.status(404).json({ message: 'Grupo no encontrado' });

    if (group.members.includes(userId)) {
      return res.status(400).json({ message: 'El usuario ya es miembro del grupo' });
    }

    group.members.push(userId);
    await group.save();

    res.status(200).json({ message: 'Usuario añadido al grupo', group });
  } catch (error) {
    res.status(500).json({ message: 'Error al añadir miembro', error });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    const group = await Group.findById(groupId);

    if (!group) return res.status(404).json({ message: 'Grupo no encontrado' });

    group.members = group.members.filter(member => member.toString() !== userId);
    group.admins = group.admins.filter(admin => admin.toString() !== userId); // Si era admin, lo quitamos
    await group.save();

    res.status(200).json({ message: 'Usuario eliminado del grupo', group });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar miembro', error });
  }
};

exports.setAdmin = async (req, res) => {
  try {
    const currentUser = req.user;
    const { groupId, userId } = req.body;
    const group = await Group.findById(groupId);

    if (!group) return res.status(404).json({ message: 'Grupo no encontrado' });

    if (!group.members.includes(userId)) {
      return res.status(400).json({ message: 'El usuario no pertenece al grupo' });
    }

    if (!group.admins.includes(currentUser._id.toString())) {
      return res.status(401).json({ message: 'Solo los admins del grupo puede asignar otro admin' });
    }

    if (!group.admins.includes(userId)) {
      group.admins.push(userId);
      await group.save();
      return res.status(200).json({ message: 'Usuario asignado como admin', group });
    }

    res.status(400).json({ message: 'El usuario ya es admin' });
  } catch (error) {
    res.status(500).json({ message: 'Error al asignar admin', error });
  }
};

exports.removeAdmin = async (req, res) => {
  try {
    const currentUser = req.user;
    const { groupId, userId } = req.body;
    const group = await Group.findById(groupId);

    if (!group) return res.status(404).json({ message: 'Grupo no encontrado' });

    if (!group.admins.includes(currentUser._id.toString())) {
      return res.status(401).json({ message: 'Solo los admins del grupo puede eliminar otro admin' });
    }

    if (group.owner.toString() === userId) {
      return res.status(400).json({ message: 'El dueño del grupo no puede perder su rol de admin' });
    }

    group.admins = group.admins.filter(admin => admin.toString() !== userId);
    await group.save();

    res.status(200).json({ message: 'Usuario eliminado como admin', group });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar admin', error });
  }
};

exports.leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Grupo no encontrado' });
    }

    if (!group.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'No eres miembro de este grupo' });
    }

    if (group.owner.toString() === req.user.id) {
      return res.status(400).json({ message: 'No puedes salir del grupo si eres el creador. Transfiere la propiedad primero.' });
    }

    group.members = group.members.filter(member => member.toString() !== req.user.id);
    group.admins = group.admins.filter(admin => admin.toString() !== req.user.id);

    await group.save();
    res.status(200).json({ message: 'Has salido del grupo', group });
  } catch (error) {
    res.status(500).json({ message: 'Error al salir del grupo', error });
  }
};

exports.transferGroupOwnership = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { newOwnerId } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Grupo no encontrado' });
    }

    if (group.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Solo el creador del grupo puede transferir la propiedad' });
    }

    if (!group.members.includes(newOwnerId)) {
      return res.status(400).json({ message: 'El nuevo propietario debe ser miembro del grupo' });
    }

    group.owner = newOwnerId;

    // Aseguramos que el nuevo dueño sea administrador también
    if (!group.admins.includes(newOwnerId)) {
      group.admins.push(newOwnerId);
    }

    await group.save();

    res.status(200).json({ message: 'Propiedad del grupo transferida correctamente', group });
  } catch (error) {
    res.status(500).json({ message: 'Error al transferir la propiedad del grupo', error });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);

    if (!group) return res.status(404).json({ message: 'Grupo no encontrado' });

    await Expense.deleteMany({ group: groupId });
    await Contribution.deleteMany({ expense: { $in: await Expense.find({ group: groupId }).select('_id') } });

    await Movement.create({
      user: group.owner,
      type: 'adjustment',
      amount: 0,
      description: `El grupo "${group.name}" ha sido eliminado.`
    });

    await Group.findByIdAndDelete(groupId);

    res.status(200).json({ message: 'Grupo eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar grupo', error });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    let { newUserMember } = req.params;
    newUserMember = newUserMember || req.user.id;

    const group = await Group.findById(groupId);
    const user = await User.findById(newUserMember);

    if (!group) return res.status(404).json({ message: 'Grupo no encontrado' });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (group.members.includes(user._id)) return res.status(501).json({ message: 'El usuario ya pertenece al grupo' });

    group.members.push(user._id);
    await group.save();
    res.status(200).json({ message: 'Usuario añadido al grupo', group });
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar usuario al grupo', error });
  }
};

exports.getSimplifiedDebts = async (req, res) => {
  try {
    const { groupId } = req.params;
    const transactions = await simplifyDebts(groupId);
    res.json(transactions);
  } catch (error) {
    console.error('Error al simplificar deudas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
