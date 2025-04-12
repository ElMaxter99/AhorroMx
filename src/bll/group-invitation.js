'use strict';

const groupInvitationRepository = require('../repository/group-invitation');

const userBll = require('./user');
const groupBll = require('./group');

const emailService = require('../services/emailService');

const INVITATION_STATUS = require('../enums/group-invitation').STATUS;
const INVITATION_STATUS_TREE = require('../enums/group-invitation').STATUS_TREE;

async function canCreateInvitation (data, user) {
  if (!data || !data.group || !data.invitedBy || !data.invitedUser) {
    return false; // Datos inválidos
  }

  const isAdmin = await userBll.isAdmin(user);
  if (isAdmin) return true; // Admin can accept any invitation

  const isOwner = await groupBll.isOwner(data.group, user);
  const isGroupAdmin = await groupBll.isAdmin(data.group, user);
  const invitedUserNotInGroup = await groupBll.isMember(data.group, data.invitedUser) === false;
  const canCreate = isAdmin || isOwner || isGroupAdmin;
  if (!canCreate) {
    return false; // Usuario sin permisos
  }

  if (!invitedUserNotInGroup) {
    return false; // El usuario ya es miembro del grupo
  }

  return true;
}
exports.canCreateInvitation = canCreateInvitation;

async function canUpdateInvitation (data, user) {
  if (!data || !data.group || !data.invitedBy || !data.invitedUser) {
    return false; // Datos inválidos
  }

  const isAdmin = await userBll.isAdmin(user);
  if (isAdmin) return true; // Admin can accept any invitation

  const isOwner = await groupBll.isOwner(data.group, user);
  const isGroupAdmin = await groupBll.isAdmin(data.group, user);
  const invitedUserNotInGroup = await groupBll.isMember(data.group, data.invitedUser) === false;
  const isSameAsInvitedBy = data.invitedBy.toString() === user.id.toString();
  const isSameAsInvitedUser = data.invitedUser.toString() === user.id.toString();
  const canUpdate = isAdmin || isOwner || isGroupAdmin || isSameAsInvitedBy;
  if (!canUpdate) {
    return false; // Usuario sin permisos
  }

  if (!invitedUserNotInGroup || !isSameAsInvitedUser) {
    return false;
  }

  return true;
}
exports.canUpdateInvitation = canUpdateInvitation;

async function canDeleteInvitation (data, user) {
  if (!data || !data.group || !data.invitedBy || !data.invitedUser) {
    return false; // Datos inválidos
  }

  const isAdmin = await userBll.isAdmin(user);
  if (isAdmin) return true; // Admin can accept any invitation

  const canDelete = isAdmin;
  if (!canDelete) {
    return false; // Usuario sin permisos
  }

  return true;
}
exports.canDeleteInvitation = canDeleteInvitation;

async function canViewInvitation (groupInvitation, user) {
  if (!groupInvitation || !user) {
    return false; // Datos inválidos
  }

  const isAdmin = await userBll.isAdmin(user);
  if (isAdmin) return true; // Admin can accept any invitation

  const isGroupMember = await groupBll.isMember(groupInvitation.group, user);
  const isInvitedBy = groupInvitation.invitedBy.toString() === user.id.toString();
  const isInvitedUser = groupInvitation.invitedUser.toString() === user.id.toString();

  return isAdmin || isGroupMember || isInvitedBy || isInvitedUser;
}
exports.canViewInvitation = canViewInvitation;

async function filterViewableInvitations (groupInvitations, user) {
  const filteredInvitations = [];

  for (const groupInvitation of groupInvitations) {
    const canViewGroupInvitation = await canViewInvitation(groupInvitation, user);
    if (canViewGroupInvitation) {
      filteredInvitations.push(groupInvitation);
    }
  }

  return filteredInvitations;
}
exports.filterViewableInvitations = filterViewableInvitations;

function canTransitionStatus (currentStatus, newStatus) {
  const allowedTransitions = INVITATION_STATUS_TREE[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
}
exports.canTransitionStatus = canTransitionStatus;

function canAcceptInvitation (groupInvitation, user) {
  if (!groupInvitation || !user) return false;

  const isAdmin = userBll.isAdmin(user);
  if (isAdmin) return true;

  const { invitedUser, status } = groupInvitation;
  const isInvitedUser = invitedUser.toString() === user.id.toString();
  const isValidStatusChange = canTransitionStatus(status, INVITATION_STATUS.DECLINED);

  const canAcceptInvitation = isInvitedUser && isValidStatusChange;
  return canAcceptInvitation;
}
exports.canAcceptInvitation = canAcceptInvitation;

function canDeclineInvitation (groupInvitation, user) {
  if (!groupInvitation || !user) return false;

  const isAdmin = userBll.isAdmin(user);
  if (isAdmin) return true;

  const { invitedUser, invitedBy, status } = groupInvitation;
  const isInvitedUser = invitedUser.toString() === user.id.toString();
  const isInvitedByUser = invitedBy.toString() === user.id.toString();
  const isAdminGroup = groupBll.isAdmin(groupInvitation.group, user);
  const isValidStatusChange = canTransitionStatus(status, INVITATION_STATUS.DECLINED);

  const canDeclineInvitation = (isInvitedByUser || isInvitedUser || isAdminGroup) && isValidStatusChange;
  return canDeclineInvitation;
}
exports.canDeclineInvitation = canDeclineInvitation;

function canCancelInvitation (groupInvitation, user) {
  if (!groupInvitation || !user) return false;

  const isAdmin = userBll.isAdmin(user);
  if (isAdmin) return true;

  const { invitedBy, status } = groupInvitation;
  const isInvitedByUser = invitedBy.toString() === user.id.toString();
  const isAdminGroup = groupBll.isAdmin(groupInvitation.group, user);
  const isValidStatusChange = canTransitionStatus(status, INVITATION_STATUS.CANCELLED);

  const canCancelInvitation = (isInvitedByUser || isAdminGroup) && isValidStatusChange;
  return canCancelInvitation;
}
exports.canCancelInvitation = canCancelInvitation;

function canSendInvitation (groupInvitation, user) {
  if (!groupInvitation || !user) return false;

  const isAdmin = userBll.isAdmin(user);
  if (isAdmin) return true;

  const { invitedBy, status } = groupInvitation;
  const isInvitedBy = invitedBy.toString() === user.id.toString();
  const isValidStatusChange = canTransitionStatus(status, INVITATION_STATUS.PENDING);

  const canSend = isInvitedBy && isValidStatusChange;
  return canSend;
}
exports.canSendInvitation = canSendInvitation;

async function sendInvitationEmail (groupInvitation) {
  const { group, invitedBy, invitedUser } = groupInvitation;
  const emailTo = invitedUser.email;
  const emailData = {
    group,
    invitee: invitedBy,
    invitationGroup: groupInvitation
  };

  await emailService.sendGroupInvitationEmail(emailTo, emailData);
}

async function create (data, user) {
  if (!(await canCreateInvitation(data, user))) {
    throw new Error('User does not have permission to create group invitation');
  }

  const groupInvitation = await groupInvitationRepository.create(data);
  return groupInvitation;
}
exports.create = create;

async function update (id, data, user) {
  const groupInvitation = await groupInvitationRepository.getById(id, { populateGroup: true });
  if (!groupInvitation) {
    throw new Error('Group invitation not found');
  }

  const canViewGroupInvitation = await canViewInvitation(groupInvitation, user);
  if (!canViewGroupInvitation) {
    throw new Error('User does not have permission to view group invitation');
  }

  const canUpdateGroupInvitation = await canUpdateInvitation(data, user);
  if (!canUpdateGroupInvitation) {
    throw new Error('User does not have permission to update group invitation');
  }

  const updatedGroupInvitation = await groupInvitationRepository.update(id, data);
  return updatedGroupInvitation;
}
exports.update = update;

async function get (options = {}, user) {
  const groupInvitation = await groupInvitationRepository.get(options);
  if (!groupInvitation) {
    return null;
  }

  const canViewGroupInvitation = await canViewInvitation(groupInvitation, user);
  if (!canViewGroupInvitation) {
    throw new Error('User does not have permission to view group invitation');
  }

  return groupInvitation;
}
exports.get = get;

async function getById (id, options = {}, user) {
  const groupInvitation = await groupInvitationRepository.getById(id, options);
  if (!groupInvitation) {
    return null;
  }

  const canViewGroupInvitation = await canViewInvitation(groupInvitation, user);
  if (!canViewGroupInvitation) {
    throw new Error('User does not have permission to view group invitation');
  }

  return groupInvitation;
}
exports.getById = getById;

async function getList (options = {}, user) {
  const groupInvitations = await groupInvitationRepository.getList(options);
  if (!groupInvitations) {
    return null;
  }

  for (const groupInvitation of groupInvitations) {
    const canViewGroupInvitation = await canViewInvitation(groupInvitation, user);
    if (!canViewGroupInvitation) {
      groupInvitations.splice(groupInvitations.indexOf(groupInvitation), 1); // Remove unauthorized invitation
    }
  }

  return groupInvitations || [];
}
exports.getList = getList;

async function getByGroup (groupId, options = {}, user) {
  const groupInvitations = await groupInvitationRepository.getListByGroup(groupId, options);
  if (!groupInvitations || groupInvitations.length === 0) {
    return [];
  }

  const filteredInvitations = await filterViewableInvitations(groupInvitations, user);
  return filteredInvitations;
}
exports.getByGroup = getByGroup;

async function getByInvitedUser (invitedUserId, options = {}, user) {
  const groupInvitations = await groupInvitationRepository.getListByInvitedUser(invitedUserId, options);
  if (!groupInvitations) {
    return null;
  }

  const filteredInvitations = await filterViewableInvitations(groupInvitations, user);
  return filteredInvitations;
}
exports.getByInvitedUser = getByInvitedUser;

async function getByInviter (invitedById, options = {}, user) {
  const groupInvitations = await groupInvitationRepository.getListByInviter(invitedById, options);
  if (!groupInvitations) {
    return null;
  }

  const filteredInvitations = await filterViewableInvitations(groupInvitations, user);
  return filteredInvitations;
}
exports.getByInviter = getByInviter;

async function getListByStatus (status, options = {}, user) {
  const groupInvitations = await groupInvitationRepository.getListByStatus(status, options);
  if (!groupInvitations) {
    return null;
  }

  const filteredInvitations = await filterViewableInvitations(groupInvitations, user);
  return filteredInvitations;
}
exports.getListByStatus = getListByStatus;

async function deleteGroupInvitation (id, user) {
  const groupInvitation = await groupInvitationRepository.getById(id, { populateGroup: true });
  if (!groupInvitation) {
    throw new Error('Group invitation not found');
  }

  const canViewGroupInvitation = await canViewInvitation(groupInvitation, user);
  if (!canViewGroupInvitation) {
    throw new Error('User does not have permission to view group invitation');
  }

  const canDelete = await canDeleteInvitation(groupInvitation, user);
  if (!canDelete) {
    throw new Error('User does not have permission to delete group invitation');
  }

  const deletedGroupInvitation = await groupInvitationRepository.delete(id);
  return deletedGroupInvitation;
}
exports.delete = deleteGroupInvitation;

async function acceptInvitation (id, user) {
  const groupInvitation = await groupInvitationRepository.getById(id, { populateGroup: true });
  if (!groupInvitation) {
    throw new Error('Group invitation not found');
  }

  const canViewGroupInvitation = await canViewInvitation(groupInvitation, user);
  if (!canViewGroupInvitation) {
    throw new Error('User does not have permission to view group invitation');
  }

  if (!canAcceptInvitation(groupInvitation, user)) {
    throw new Error('User cannot accept the group invitation');
  }

  const updatedGroupInvitation = await groupInvitationRepository.updateStatus(id, INVITATION_STATUS.ACCEPTED);
  await groupBll.addMember(groupInvitation.group, updatedGroupInvitation.invitedUser, user);
  return updatedGroupInvitation;
}
exports.acceptInvitation = acceptInvitation;

async function declineInvitation (id, user) {
  const groupInvitation = await groupInvitationRepository.getById(id, { populateGroup: true });
  if (!groupInvitation) {
    throw new Error('Group invitation not found');
  }

  const canViewGroupInvitation = await canViewInvitation(groupInvitation, user);
  if (!canViewGroupInvitation) {
    throw new Error('User does not have permission to view group invitation');
  }

  if (!canDeclineInvitation(groupInvitation, user)) {
    throw new Error('User cannot decline the group invitation');
  }

  const updatedGroupInvitation = await groupInvitationRepository.updateStatus(id, INVITATION_STATUS.DECLINED);
  return updatedGroupInvitation;
}
exports.declineInvitation = declineInvitation;

async function cancelInvitation (id, user) {
  const groupInvitation = await groupInvitationRepository.getById(id, { populateGroup: true });
  if (!groupInvitation) {
    throw new Error('Group invitation not found');
  }

  const canViewGroupInvitation = await canViewInvitation(groupInvitation, user);
  if (!canViewGroupInvitation) {
    throw new Error('User does not have permission to view group invitation');
  }

  if (!canCancelInvitation(groupInvitation, user)) {
    throw new Error('User cannot cancel the group invitation');
  }

  const updatedGroupInvitation = await groupInvitationRepository.updateStatus(id, INVITATION_STATUS.CANCELLED);
  return updatedGroupInvitation;
}
exports.cancelInvitation = cancelInvitation;

async function deleteStatusInvitation (id, user) {
  const groupInvitation = await groupInvitationRepository.getById(id, { populateGroup: true });
  if (!groupInvitation) {
    throw new Error('Group invitation not found');
  }

  const canViewGroupInvitation = await canViewInvitation(groupInvitation, user);
  if (!canViewGroupInvitation) {
    throw new Error('User does not have permission to view group invitation');
  }

  const isAdmin = await userBll.isAdmin(user);
  const isInvitedUser = user.id.toString() !== groupInvitation.invitedBy.toString();

  if (!isAdmin && !isInvitedUser) {
    throw new Error('User cannot delete status the group invitation');
  }

  const deletedGroupInvitation = await groupInvitationRepository.updateStatus(id, INVITATION_STATUS.DELETED);
  return deletedGroupInvitation;
}
exports.deleteStatusInvitation = deleteStatusInvitation;

async function updateStatus (id, status, user) {
  const groupInvitation = await groupInvitationRepository.getById(id, { populateGroup: true });
  if (!groupInvitation) {
    throw new Error('Group invitation not found');
  }

  const canViewGroupInvitation = await canViewInvitation(groupInvitation, user);
  if (!canViewGroupInvitation) {
    throw new Error('User does not have permission to view group invitation');
  }

  if (!canUpdateInvitation(groupInvitation, user)) {
    throw new Error('User cannot update the group invitation');
  }

  const updatedGroupInvitation = await groupInvitationRepository.updateStatus(id, status);
  return updatedGroupInvitation;
}
exports.updateStatus = updateStatus;

async function sendInvitation (id, user) {
  const groupInvitation = await groupInvitationRepository.getById(id, { populateGroup: true });
  if (!groupInvitation) {
    throw new Error('Group invitation not found');
  }

  const canSend = await canSendInvitation(groupInvitation, user);
  if (!canSend) {
    throw new Error('User does not have permission to send email group invitation');
  }

  await sendInvitationEmail(groupInvitation).catch((error) => {
    throw new Error('Failed to send invitation email', error);
  });

  updateStatus(id, INVITATION_STATUS.PENDING, user).catch((error) => {
    throw new Error('Failed to update invitation status', error);
  });

  return groupInvitation;
}
exports.sendInvitation = sendInvitation;
