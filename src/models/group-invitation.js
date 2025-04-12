const mongoose = require('mongoose');

const { STATUS } = require('../enums/group-invitation');

const groupInvitationSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    invitedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.DRAFT
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('GroupInvitation', groupInvitationSchema);
