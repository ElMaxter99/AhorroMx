'use strict';

const Group = require('../models/group');

const { parseQueryValues } = require('../utils/repositoryUtils');

function getQueryFromOptions (options = {}) {
  const query = {};
  if (options.name) {
    query.name = parseQueryValues(options.name);
  }

  if (options.owner) {
    query.owner = parseQueryValues(options.owner);
  }

  if (options.admins) {
    query.admins = parseQueryValues(options.admins);
  }

  if (options.members) {
    query.members = parseQueryValues(options.members);
  }

  if (options.startDate || options.endDate) {
    query.date = {};
    if (options.startDate) {
      query.date.$gte = new Date(options.startDate);
    }
    if (options.endDate) {
      query.date.$lte = new Date(options.endDate);
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

  if (options.removeOwner) {
    projection.owner = 0;
  }

  if (options.removeMembers) {
    projection.members = 0;
  }

  if (options.removeAdmins) {
    projection.admins = 0;
  }

  if (options.removeProfileInfo) {
    projection.profileInfo = 0;
  }

  return projection;
}

function getPopulationFromOptions (options = {}) {
  const population = [];
  if (options.populateOwner) {
    population.push({ path: 'owner', select: '-credentials' });
  }

  if (options.populateAdmins) {
    population.push({ path: 'admins', select: '-credentials' });
  }

  if (options.populateMembers) {
    population.push({ path: 'members', select: '-credentials' });
  }

  return population;
}

function buildQueryProjectionAndPopulation (options = {}) {
  const query = getQueryFromOptions(options) || {};
  const projection = getProjectionFromOptions(options) || {};
  const population = getPopulationFromOptions(options) || [];

  return { query, projection, population };
}

async function create (groupData) {
  try {
    if (!groupData) {
      throw new Error('Invalid input: groupData is required');
    }

    const result = await Group.create(groupData);
    return result;
  } catch (error) {
    throw new Error('Error creating group: ' + error.message);
  }
}

async function update (groupId, groupData) {
  try {
    if (!groupId || !groupData) {
      throw new Error('Invalid input: groupId and groupData are required');
    }

    const result = await Group.findByIdAndUpdate(groupId, groupData, { new: true });
    if (!result) {
      throw new Error('Group not found or no changes made');
    }

    return result;
  } catch (error) {
    throw new Error('Error updating group: ' + error.message);
  }
}

async function get (options = {}) {
  try {
    const { query, projection, population } = buildQueryProjectionAndPopulation(options);
    const group = await Group.findOne(query, projection).populate(population);
    return group;
  } catch (error) {
    throw new Error('Error fetching group: ' + error.message);
  }
}

async function getById (groupId, options = {}) {
  try {
    const { projection, population } = buildQueryProjectionAndPopulation(options);
    const group = await Group.findById(groupId, projection).populate(population);
    if (!group) {
      throw new Error('Group not found');
    }

    return group;
  } catch (error) {
    throw new Error('Error fetching group: ' + error.message);
  }
}

async function getList (options = {}) {
  try {
    const { query, projection, population } = buildQueryProjectionAndPopulation(options);
    const group = await Group.find(query, projection).populate(population);
    return group;
  } catch (error) {
    throw new Error('Error fetching group: ' + error.message);
  }
}

async function deleteGroup (groupId) {
  try {
    const result = await Group.deleteById(groupId);
    return result;
  } catch (error) {
    throw new Error('Error deleting group: ' + error.message);
  }
}

async function getListByUser (userId, options = {}) {
  try {
    const { projection, population } = buildQueryProjectionAndPopulation(options);
    const groups = await Group.find(
      { $or: [{ members: { $in: [userId] } }, { admins: { $in: [userId] } }, { owner: userId }] },
      projection
    ).populate(population);
    return groups;
  } catch (error) {
    throw new Error('Error fetching groups: ' + error.message);
  }
}

async function addMember (groupId, userId) {
  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $push: { members: userId } },
      { new: true }
    );

    return updatedGroup;
  } catch (error) {
    throw new Error('Error adding member: ' + error.message);
  }
}

async function removeMember (groupId, userId) {
  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: userId } },
      { new: true }
    );

    return updatedGroup;
  } catch (error) {
    throw new Error('Error removing member: ' + error.message);
  }
}

async function addAdmin (groupId, userId) {
  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $push: { admins: userId } },
      { new: true }
    );

    return updatedGroup;
  } catch (error) {
    throw new Error('Error adding admin: ' + error.message);
  }
}

async function removeAdmin (groupId, userId) {
  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { admins: userId } },
      { new: true }
    );

    return updatedGroup;
  } catch (error) {
    throw new Error('Error removing admin: ' + error.message);
  }
}

async function updateOwner (groupId, userId) {
  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { owner: userId },
      { new: true }
    );

    return updatedGroup;
  } catch (error) {
    throw new Error('Error updating owner: ' + error.message);
  }
}

module.exports = {
  create,
  get,
  getById,
  getList,
  getListByUser,
  update,
  delete: deleteGroup,
  addMember,
  removeMember,
  addAdmin,
  removeAdmin,
  updateOwner
};
