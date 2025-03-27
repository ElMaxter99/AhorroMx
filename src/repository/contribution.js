'use strict';

const Contribution = require('../models/contribution');

async function createContribution (contributionData) {
  try {
    const contribution = await Contribution.create(contributionData);
    return contribution;
  } catch (error) {
    throw new Error('Error creating contribution: ' + error.message);
  }
}

async function updateContribution (contributionId, contributionData) {
  try {
    if (!contributionId || !contributionData) {
      throw new Error('Invalid input: contributionId and contributionData are required');
    }
    const contribution = await Contribution.findByIdAndUpdate(contributionId, contributionData, { new: true });
    if (!contribution) {
      throw new Error('Contribution not found or no changes made');
    }
    return contribution;
  } catch (error) {
    throw new Error('Error updating contribution: ' + error.message);
  }
}

async function getContributionById (contributionId) {
  try {
    const contribution = await Contribution.findById(contributionId);
    if (!contribution) {
      throw new Error('Contribution not found');
    }
    return contribution;
  } catch (error) {
    throw new Error('Error fetching contribution: ' + error.message);
  }
}

async function deleteContribution (contributionId) {
  try {
    const result = await Contribution.deleteById(contributionId);
    if (!result) {
      throw new Error('Contribution not found');
    }
    return result;
  } catch (error) {
    throw new Error('Error deleting contribution: ' + error.message);
  }
}

async function listContributions (filter = {}) {
  try {
    const contributions = await Contribution.find(filter);
    return contributions;
  } catch (error) {
    throw new Error('Error listing contributions: ' + error.message);
  }
}

async function listContributionsByExpense (expenseId) {
  try {
    const contributions = await Contribution.find({ expense: expenseId });
    return contributions;
  } catch (error) {
    throw new Error('Error listing contributions: ' + error.message);
  }
}

async function listContributionsByUser (userId, options = {}) {
  try {
    const filter = { user: userId };

    if (options.fromDate || options.toDate) {
      filter.creationDate = {};
      if (options.fromDate) {
        filter.creationDate.$gte = options.fromDate;
      }

      if (options.toDate) {
        filter.creationDate.$lte = options.toDate;
      }
    }

    const contributions = await Contribution.find(filter);
    return contributions;
  } catch (error) {
    throw new Error('Error listing contributions: ' + error.message);
  }
}

module.exports = {
  createContribution,
  updateContribution,
  getContributionById,
  deleteContribution,
  listContributions,
  listContributionsByExpense,
  listContributionsByUser
};
