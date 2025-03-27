'use strict';

const Group = require('../models/group');

async function createGroup (groupData) {
  try {
    const result = await Group.create(groupData);
    return result;
  } catch (error) {
    throw new Error('Error creating group: ' + error.message);
  }
}

async function updateGroup (groupId, groupData) {
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

async function getGroupById (groupId) {
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }
    return group;
  } catch (error) {
    throw new Error('Error fetching group: ' + error.message);
  }
}

async function deleteGroup (groupId) {
  try {
    const result = await Group.deleteById(groupId);
    if (!result) {
      throw new Error('Group not found');
    }
    return result;
  } catch (error) {
    throw new Error('Error deleting group: ' + error.message);
  }
}

async function listGroups (filter = {}) {
  try {
    const groups = await Group.find(filter);
    return groups;
  } catch (error) {
    throw new Error('Error listing groups: ' + error.message);
  }
}

async function getGroupByUser (userId) {
  try {
    const groups = await Group.find({ members: userId });
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

async function updateGroupOwner (groupId, userId) {
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
  createGroup,
  getGroupById,
  updateGroup,
  deleteGroup,
  listGroups,
  getGroupByUser,
  addMember,
  removeMember,
  addAdmin,
  removeAdmin,
  updateGroupOwner
};
