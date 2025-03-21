const sendEmail = require('../utils/emailSender');
const config = require('../../config');

const GROUP_INVITATION_STATUS = require('../enums/groupInvitation').STATUS;

/**
 * Envía una invitación a un grupo.
 */
const sendGroupInvitationEmail = async (emailTo, data) => {
  const { invitee, group, invitationGroup } = data;

  const acceptLink = `${config.FRONTEND_URL}/group-invitations/invitation/${invitationGroup._id}status?=${GROUP_INVITATION_STATUS.ACCEPTED}`;
  const rejectLink = `${config.FRONTEND_URL}/group-invitations/invitation${invitationGroup._id}/status?=${GROUP_INVITATION_STATUS.DECLINED}`;

  const subject = `📩 Invitación a un grupo`;
  const template = {
    templateType: 'emails',
    templateName: 'groupInvitation',
  };

  const templateData = {
    groupName: group.name,
    groupIcon: group.profileInfo.photoUrl || 'https://avatar.iran.liara.run/public', // TODO Refactor default img
    acceptLink: acceptLink,
    rejectLink: rejectLink,
    invitee: invitee,
  };

  await sendEmail(emailTo, subject, template, templateData);
};

module.exports = { 
  sendGroupInvitationEmail,
};
