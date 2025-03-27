'use strict';

const User = require('../models/user');

function buildQueryAndProjection (options = {}) {
  let filter = {};
  const projection = {};

  if (options._id) {
    filter._id = options._id;
  }

  if (options.email) {
    filter.email = options.email;
  }

  if (options.username) {
    filter.username = options.username;
  }

  if (options.active !== undefined) {
    filter.active = options.active;
  }

  if (options.role) {
    filter.role = options.role;
  }

  if (options.globalFilter) {
    filter = { ...filter, ...options.globalFilter };
  }

  if (options.removeCredentials) {
    projection.credentials = 0;
  }

  if (options.removePersonalInfo) {
    projection.personalInfo = 0;
  }

  if (options.removeProfileInfo) {
    projection.profileInfo = 0;
  }

  return { filter, projection };
}

async function createUser (userData) {
  try {
    const user = await User.create(userData);
    return user;
  } catch (error) {
    throw new Error('Error creating user: ' + error.message);
  }
}

async function updateUser (userId, userData) {
  try {
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
  const { filter, projection } = buildQueryAndProjection(options);

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
  const { filter, projection } = buildQueryAndProjection(options);

  try {
    const users = await User.find(filter, projection);
    return users;
  } catch (error) {
    throw new Error('Error listing users: ' + error.message);
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

module.exports = {
  createUser,
  updateUser,
  getUser,
  getUserList,
  deleteUser,
  addRol,
  removeRol,
  updatePassword,
  updateStatus
};
