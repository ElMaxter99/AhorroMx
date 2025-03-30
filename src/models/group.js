const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    profileInfo: {
      photoUrl: { type: String, default: '' },
      backgroundUrl: { type: String, default: '' }
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    admins: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
    members: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);
