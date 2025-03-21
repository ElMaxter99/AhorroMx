'use strict';

const groupModel = require("../models/group");

exports.validateUserInGroup = async (userId, groupId) => {
    const group = await groupModel.findById(groupId);
    if (!group) {
        throw new Error("El grupo no existe.");
    }

    return !group || !group.members.includes(userId);
};