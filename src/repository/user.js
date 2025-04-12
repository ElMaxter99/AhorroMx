'use strict';

const User = require('../models/user');

const { parseQueryValues } = require('../utils/repositoryUtils');

function getQueryFromOptions (options = {}) {
  const query = {};
  if (options.username) {
    query.username = parseQueryValues(options.username);
  }

  if (options.email) {
    query.email = parseQueryValues(options.email);
  }

  if (options.role) {
    query.role = parseQueryValues(options.role);
  }

  if (options.active) {
    query.active = parseQueryValues(options.active);
  }

  if (options.deleted) {
    query.deleted = parseQueryValues(options.deleted);
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

  if (options.removeCredentials) {
    projection.credentials = 0;
  }

  if (options.removeProfileInfo) {
    projection.profileInfo = 0;
  }

  if (options.removeUsername) {
    projection.username = 0;
  }

  if (options.removeEmail) {
    projection.email = 0;
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

async function createUser (userData) {
  try {
    if (!userData) {
      throw new Error('User data is required');
    }

    const user = await User.create(userData);
    return user;
  } catch (error) {
    throw new Error('Error creating user: ' + error.message);
  }
}

async function updateUser (userId, userData) {
  try {
    if (!userId || !userData) {
      throw new Error('User ID and data are required');
    }

    const updatedUser = await User.updateOne({ _id: userId }, userData);
    if (!updatedUser) {
      throw new Error('User not found or no changes made');
    }

    return updatedUser;
  } catch (error) {
    throw new Error('Error updating user: ' + error.message);
  }
}

async function getUser (options = {}) {
  const { filter, projection } = buildQueryProjectionAndPopulation(options);

  try {
    const user = await User.findOne(filter, projection);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw new Error('Error fetching user: ' + error.message);
  }
}

async function getById (userId, options = {}) {
  try {
    const { projection, population } = buildQueryProjectionAndPopulation(options);
    const user = await User.findById(userId, projection).populate(population);
    return user;
  } catch (error) {
    throw new Error('Error fetching user by ID: ' + error.message);
  }
}

async function getProfile (userId, options = {}) {
  try {
    const user = await User.findById(userId, { profileInfo: 1 });
    return user.profileInfo;
  } catch (error) {
    throw new Error('Error fetching user profile: ' + error.message);
  }
}

async function deleteUser (userId) {
  try {
    const result = await User.deleteOne({ _id: userId });
    if (!result) {
      throw new Error('User not found');
    }
    return result;
  } catch (error) {
    throw new Error('Error deleting user: ' + error.message);
  }
}

async function getUserList (options = {}) {
  const { filter, projection } = buildQueryProjectionAndPopulation(options);

  try {
    const users = await User.find(filter, projection);
    return users;
  } catch (error) {
    throw new Error('Error listing users: ' + error.message);
  }
}

async function updateRoles (userId, newRoles) {
  try {
    const userResult = await User.findByIdAndUpdate(
      userId, { $set: { role: newRoles } }, { new: true }
    );
    if (!userResult) {
      throw new Error('User not found');
    }

    return userResult;
  } catch (error) {
    throw new Error('Error updating roles: ' + error.message);
  }
}

async function addRol (userId, roleName) {
  try {
    const userResult = await User.findByIdAndUpdate(
      userId, { $push: { role: roleName } }, { new: true }
    );
    if (!userResult) {
      throw new Error('User not found');
    }

    return userResult;
  } catch (error) {
    throw new Error('Error adding rol: ' + error.message);
  }
}

async function removeRol (userId, roleName) {
  try {
    const userResult = await User.findByIdAndUpdate(
      userId, { $pull: { role: roleName } }, { new: true }
    );
    if (!userResult) {
      throw new Error('User not found');
    }

    return userResult;
  } catch (error) {
    throw new Error('Error removing rol: ' + error.message);
  }
}

async function updatePassword (userId, newPlainPassword) {
  try {
    const userResult = await User.findByIdAndUpdate(
      userId, { $set: { password: newPlainPassword } }, // userModel encrypts the password before saving
      { new: true }
    );
    if (!userResult) {
      throw new Error('User not found');
    }

    return userResult;
  } catch (error) {
    throw new Error('Error updating password: ' + error.message);
  }
}

async function updateEmail (userId, newEmail) {
  try {
    const userResult = await User.findByIdAndUpdate(
      userId, { $set: { email: newEmail } }, { new: true }
    );
    if (!userResult) {
      throw new Error('User not found');
    }

    return userResult;
  } catch (error) {
    throw new Error('Error updating email: ' + error.message);
  }
}

async function updateStatus (userId, newStatus) {
  try {
    const userResult = await User.findByIdAndUpdate(
      userId, { $set: { active: newStatus } }, { new: true }
    );
    if (!userResult) {
      throw new Error('User not found');
    }

    return userResult;
  } catch (error) {
    throw new Error('Error updating status: ' + error.message);
  }
}

async function updateProfileInfo (userId, newProfileInfo) {
  try {
    const userResult = await User.findByIdAndUpdate(
      userId, { $set: { profileInfo: newProfileInfo } }, { new: true }
    );
    if (!userResult) {
      throw new Error('User not found');
    }

    return userResult;
  } catch (error) {
    throw new Error('Error updating profile info: ' + error.message);
  }
}

async function updateProfilePicture (userId, newProfilePicture) {
  try {
    const userResult = await User.findByIdAndUpdate(
      userId, { $set: { 'profileInfo.photoUrl': newProfilePicture } }, { new: true }
    );
    if (!userResult) {
      throw new Error('User not found');
    }

    return userResult;
  } catch (error) {
    throw new Error('Error updating profile picture: ' + error.message);
  }
}

async function activeUser (userId) {
  try {
    const userResult = await User.findByIdAndUpdate(
      userId, { $set: { active: true } }, { new: true }
    );
    if (!userResult) {
      throw new Error('User not found');
    }

    return userResult;
  } catch (error) {
    throw new Error('Error activating user: ' + error.message);
  }
}

async function deactivateUser (userId) {
  try {
    const userResult = await User.findByIdAndUpdate(
      userId, { $set: { active: false } }, { new: true }
    );
    if (!userResult) {
      throw new Error('User not found');
    }

    return userResult;
  } catch (error) {
    throw new Error('Error deactivating user: ' + error.message);
  }
}

async function falseDeleteUser (userId) {
  try {
    const userResult = await User.findByIdAndUpdate(
      userId, { $set: { deleted: true } }, { new: true }
    );
    if (!userResult) {
      throw new Error('User not found');
    }

    return userResult;
  } catch (error) {
    throw new Error('Error deleting user: ' + error.message);
  }
}

module.exports = {
  create: createUser,
  update: updateUser,
  get: getUser,
  getById,
  getProfile,
  getList: getUserList,
  delete: deleteUser,
  updateRoles,
  addRol,
  removeRol,
  updatePassword,
  updateEmail,
  updateStatus,
  updateProfileInfo,
  updateProfilePicture,
  activeUser,
  deactivateUser,
  falseDeleteUser
};
