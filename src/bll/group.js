'use strict';

const groupModel = require("../models/group");
const { USER_ROLES } = require("../enums/user");

function applyPopulateOptions(query, options) {
	const { populateOwner, populateAdmins, populateMembers } = options;

	if (populateOwner === "true") {
		query = query.populate("owner");
	}

	if (populateAdmins === "true") {
		query = query.populate("admins");
	}

	if (populateMembers === "true") {
		query = query.populate("members");
	}

	return query;
}

exports.validateUserInGroup = async function validateUserInGroup(userId, groupId) {
	const group = await groupModel.findById(groupId);
	if (!group) {
		throw new Error("El grupo no existe.");
	}

	return !group || !group.members?.includes(userId);
};

exports.createGroup = async function createGroup(data, user) {
	data.owner = data.owner || user._id;
	data.admins = data.admins || [user._id];
	data.members = data.members || [user._id];

	const group = new groupModel(data);
	const createdGroup = await group.save();
	return createdGroup;
};

exports.getGroupById = async function getGroupById(groupId, user, options) {
	let query = groupModel.findById(groupId);
	query = applyPopulateOptions(query, options);

	try {
		const group = await query;
		if (!group) {
			throw new Error("El grupo no existe.");
		}

		const isAdmin = user.role.includes(USER_ROLES.ADMIN);
		const isMember = group?.members?.includes(user._id);

		if (!isAdmin && !isMember) {
			throw new Error("No tienes permiso para ver este grupo.");
		}

		return group;
	} catch (error) {
		console.error("Error al obtener el grupo:", error);
		throw new Error("Hubo un error al obtener el grupo.");
	}
};

exports.updateGroup = async function updateGroup(groupId, newData, user) {
	const group = await groupModel.findById(groupId);
	if (!group) {
		throw new Error("El grupo no existe.");
	}

	const isAdmin = user.role.includes(USER_ROLES.ADMIN);
	const isMember = group.members?.includes(user._id) || false;
	if (!isAdmin && !isMember) {
		throw new Error("No tienes permiso para actualizar este grupo.");
	}

	Object.assign(group, newData);
	try {
		await group.save();
		return group;
	} catch (error) {
		console.error(`Error al actualizar el grupo con ID ${groupId} por el usuario ${user._id}:`, error);
		throw new Error("Hubo un error al actualizar el grupo.");
	}
};

exports.deleteGroup = async function deleteGroup(groupId, user) {
	const group = await groupModel.findById(groupId);
	if (!group) {
		throw new Error("El grupo no existe.");
	}

	const isAdmin = user.role.includes(USER_ROLES.ADMIN);
	const isOwner = group.owner === user._id;
	if (!isAdmin && !isOwner) {
		throw new Error("No tienes permiso para eliminar este grupo.");
	}

	try {
		return await group.delete();
	} catch (error) {
		console.error("Error al eliminar el grupo:", error);
		throw new Error("Hubo un error al eliminar el grupo.");
	}
};

exports.addMember = async function addMember(groupId, userId, user) {
	const group = await groupModel.findById(groupId);
	if (!group) {
		throw new Error("El grupo no existe.");
	}

	const isAdmin = user.role.includes(USER_ROLES.ADMIN);
	const isOwner = group.owner === user._id;
	const isAdminGroup = group.admins?.includes(user._id);
	if (!isAdmin && !isOwner && !isAdminGroup) {
		throw new Error("No tienes permiso para agregar miembros a este grupo.");
	}

	group.members = group.members || [];
	group.members.push(userId);
	await group.save();
	return group;
};

exports.removeMember = async function removeMember(groupId, userId, user) {
	const group = await groupModel.findById(groupId);
	if (!group) {
		throw new Error("El grupo no existe.");
	}

	const isAdmin = user.role.includes(USER_ROLES.ADMIN);
	const isOwner = group.owner === user._id;
	const isAdminGroup = group.admins?.includes(user._id);
	const isTargetAdmin = group.admins?.includes(userId);
	const isSelfRemoval = userId === user._id;

	if (userId === group.owner) {
		throw new Error("No puedes remover al propietario del grupo.");
	}

	if (!isOwner && !isSelfRemoval && (!isAdmin && !isAdminGroup)) {
		throw new Error("No tienes permiso para remover miembros de este grupo.");
	}

	if (!isOwner && !isSelfRemoval && isAdminGroup && isTargetAdmin) {
		throw new Error("No puedes remover a otro administrador del grupo.");
	}

	group.members = group.members?.filter((member) => member !== userId) || [];
	group.admins = group.admins?.filter((admin) => admin !== userId) || [];

	await group.save();
	return group;
};

exports.addAdmin = async function addAdmin(groupId, userId, user) {
	const group = await groupModel.findById(groupId);
	if (!group) {
		throw new Error("El grupo no existe.");
	}

	const isAdmin = user.role.includes(USER_ROLES.ADMIN);
	const isOwner = group.owner === user._id;
	if (!isAdmin && !isOwner) {
		throw new Error("No tienes permiso para agregar administradores a este grupo.");
	}

	group.admins = group.admins || [];
	group.admins.push(userId);
	await group.save();
	return group;
};

exports.removeAdmin = async function removeAdmin(groupId, userId, user) {
	const group = await groupModel.findById(groupId);
	if (!group) {
		throw new Error("El grupo no existe.");
	}

	const isAdmin = user.role.includes(USER_ROLES.ADMIN);
	const isOwner = group.owner === user._id;
	if (!isAdmin && !isOwner) {
		throw new Error("No tienes permiso para remover administradores de este grupo.");
	}

	group.admins = group.admins || [];
	group.admins = group.admins.filter((admin) => admin !== userId);
	await group.save();
	return group;
};

exports.getGroupsByUser = async function getGroupsByUser(userId, user, options = {}) {
	let query = groupModel.find({ members: userId });
	query = applyPopulateOptions(query, options);

	try {
		const groups = await query;
		if (!groups) {
			throw new Error("No se encontraron grupos.");
		}

		const isAdmin = user.role.includes(USER_ROLES.ADMIN);
		const isMember = group.members?.includes(user._id);
		if (!isAdmin && !isMember) {
			throw new Error("No tienes permiso para ver este grupo.");
		}

		return groups;
	} catch (error) {
		console.error("Error al obtener los grupos:", error);
		throw new Error("Hubo un error al obtener los grupos.");
	}
};

exports.getGroupsByOwner = async function getGroupsByOwner(userId, user, options = {}) {
	let query = groupModel.find({ owner: userId });
	query = applyPopulateOptions(query, options);

	try {
		const groups = await query;
		if (!groups) {
			throw new Error("No se encontraron grupos.");
		}

		const isAdmin = user.role.includes(USER_ROLES.ADMIN);
		const isMember = group.members?.includes(user._id);
		if (!isAdmin && !isMember) {
			throw new Error("No tienes permiso para ver este grupo.");
		}

		return groups;
	} catch (error) {
		console.error("Error al obtener los grupos:", error);
		throw new Error("Hubo un error al obtener los grupos.");
	}
};

exports.transferGroupOwnership = async function transferGroupOwnership(groupId, newOwnerId, user) {
	const group = await groupModel.findById(groupId);
	if (!group) {
		throw new Error("El grupo no existe.");
	}

	if (group.owner === newOwnerId) {
		throw new Error("El nuevo propietario ya es propietario del grupo.");
	}

	if (!group.members?.includes(newOwnerId)) {
		throw new Error("El nuevo propietario no es miembro del grupo.");
	}

	if (!group.admins?.includes(newOwnerId)) {
		throw new Error("El nuevo propietario no es administrador del grupo.");
	}	

	const isAdmin = user.role.includes(USER_ROLES.ADMIN);
	const isOwner = group.owner === user._id;
	if (!isAdmin && !isOwner) {
		throw new Error("No tienes permiso para transferir la propiedad de este grupo.");
	}

	group.owner = newOwnerId;
	await group.save();
	return group;
};