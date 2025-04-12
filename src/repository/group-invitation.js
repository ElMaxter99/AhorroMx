'use strict';

const GroupInvitation = require('../models/group-invitation');

const { parseQueryValues } = require('../utils/repositoryUtils');

function getQueryFromOptions (options = {}) {
  const query = {};
  if (options.group) {
    query.group = parseQueryValues(options.group);
  }

  if (options.invitedBy) {
    query.invitedBy = parseQueryValues(options.invitedBy);
  }

  if (options.invitedUser) {
    query.invitedUser = parseQueryValues(options.invitedUser);
  }

  if (options.status) {
    query.status = parseQueryValues(options.status);
  }

  if (options.startDate || options.endDate) {
    query.creationDate = {};
    if (options.startDate) {
      query.creationDate.$gte = new Date(options.startDate);
    }
    if (options.endDate) {
      query.creationDate.$lte = new Date(options.endDate);
    }
  }

  return query;
}

function getProjectionFromOptions (options = {}) {
  let projection = {};
  if (options.removeTimestamps) {
    projection.creationDate = 0;
    projection.updateDate = 0;
  }

  if (options.removeGroup) {
    projection.group = 0;
  }

  if (options.removeInvitedBy) {
    projection.invitedBy = 0;
  }

  if (options.removeInvitedUser) {
    projection.invitedUser = 0;
  }

  if (options.removeStatus) {
    projection.status = 0;
  }

  return projection;
}

function getPopulationFromOptions (options = {}) {
  const population = [];
  if (options.populateGroup) {
    population.push({ path: 'group' });
  }

  if (options.populateInvitedBy) {
    population.push({ path: 'invitedBy', select: '-credentials' });
  }

  if (options.populateInvitedUser) {
    population.push({ path: 'invitedUser', select: '-credentials' });
  }

  return population;
}

function buildQueryProjectionAndPopulation (options = {}) {
  const query = getQueryFromOptions(options) || {};
  const projection = getProjectionFromOptions(options) || {};
  const population = getPopulationFromOptions(options) || [];

  return { query, projection, population };
}

async function create (groupInvitationData) {
  try {
    if (!groupInvitationData) {
      throw new Error('Group invitation data is required');
    }

    const result = await GroupInvitation.create(groupInvitationData);
    await result.populate([
      { path: 'group' },
      { path: 'invitedBy', select: '-credentials' },
      { path: 'invitedUser', select: '-credentials' }
    ]);
    return result;
  } catch (error) {
    throw new Error('Error creating group invitation: ' + error.message);
  }
}

async function update (groupInvitationId, newData) {
  try {
    if (!groupInvitationId || !newData) {
      throw new Error('Group invitation ID and new data are required');
    }

    const result = await GroupInvitation.findByIdAndUpdate(groupInvitationId, newData, { new: true });
    if (!result) {
      throw new Error('Group invitation not found');
    }

    return result;
  } catch (error) {
    throw new Error('Error updating group invitation: ' + error.message);
  }
}

async function updateStatus (groupInvitationId, newStatus) {
  try {
    if (!groupInvitationId || !newStatus) {
      throw new Error('Group invitation ID and new status are required');
    }

    const result = await GroupInvitation.findByIdAndUpdate(groupInvitationId, { status: newStatus }, { new: true });
    if (!result) {
      throw new Error('Group invitation not found');
    }

    return result;
  } catch (error) {
    throw new Error('Error updating group invitation status: ' + error.message);
  }
}

async function deleteGroupInvitation (groupInvitationId) {
  try {
    const result = await GroupInvitation.findByIdAndDelete(groupInvitationId);
    if (!result) {
      throw new Error('Group invitation not found');
    }

    return result;
  } catch (error) {
    throw new Error('Error deleting group invitation: ' + error.message);
  }
}

async function get (options = {}) {
  try {
    const { query, projection, population } = buildQueryProjectionAndPopulation(options);
    const groupInvitations = await GroupInvitation.find(query).select(projection).populate(population);
    return groupInvitations;
  } catch (error) {
    throw new Error('Error retrieving group invitations: ' + error.message);
  }
}

async function getById (groupInvitationId, options = {}) {
  try {
    const { projection, population } = buildQueryProjectionAndPopulation(options);
    const groupInvitation = await GroupInvitation.findById(groupInvitationId).select(projection).populate(population);
    if (!groupInvitation) {
      throw new Error('Group invitation not found');
    }

    return groupInvitation;
  } catch (error) {
    throw new Error('Error retrieving group invitation: ' + error.message);
  }
}

async function getList (options = {}) {
  try {
    const { query, projection, population } = buildQueryProjectionAndPopulation(options);
    const groupInvitations = await GroupInvitation.find(query).select(projection).populate(population);
    return groupInvitations;
  } catch (error) {
    throw new Error('Error retrieving group invitation list: ' + error.message);
  }
}

async function getListByGroup (groupId, options = {}) {
  try {
    if (!groupId) {
      throw new Error('Group is required');
    }

    let { query, projection, population } = buildQueryProjectionAndPopulation(options);
    query.group = groupId;

    const groupInvitations = await GroupInvitation.find(query).select(projection).populate(population);
    return groupInvitations;
  } catch (error) {
    throw new Error('Error retrieving group invitations by Group: ' + error.message);
  }
}

async function getListByStatus (status, options = {}) {
  try {
    if (!status) {
      throw new Error('Status is required');
    }

    let { query, projection, population } = buildQueryProjectionAndPopulation(options);
    query.status = status;

    const groupInvitations = await GroupInvitation.find(query).select(projection).populate(population);
    return groupInvitations;
  } catch (error) {
    throw new Error('Error retrieving group invitations by Status: ' + error.message);
  }
}

async function getListByInvitedUser (invitedUserId, options = {}) {
  try {
    if (!invitedUserId) {
      throw new Error('invitedUserId is required');
    }

    const { query, projection, population } = buildQueryProjectionAndPopulation(options);
    query.invitedUser = invitedUserId;

    const groupInvitations = await GroupInvitation.find(query).select(projection).populate(population);
    return groupInvitations;
  } catch (error) {
    throw new Error('Error retrieving group invitations by invitedUser: ' + error.message);
  }
}

async function getListByInviter (inviterId, options = {}) {
  try {
    if (!inviterId) {
      throw new Error('inviterId is required');
    }

    const { query, projection, population } = buildQueryProjectionAndPopulation(options);
    query.invitedBy = inviterId;

    const groupInvitations = await GroupInvitation.find(query).select(projection).populate(population);
    return groupInvitations;
  } catch (error) {
    throw new Error('Error retrieving group invitations by inviterId: ' + error.message);
  }
}

module.exports = {
  create,
  update,
  updateStatus,
  delete: deleteGroupInvitation,
  get,
  getById,
  getList,
  getListByGroup,
  getListByStatus,
  getListByInvitedUser,
  getListByInviter
};
