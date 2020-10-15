"use strict";
const nodemailer = require('nodemailer');
const logger = require('./logging');
const { getCurrentUser } = require('../utils/users');

// async..await is not allowed in global scope, must use a wrapper
async function mailer(invite, socket) {

    const user = getCurrentUser(socket.id);
    if(user.type !== 'admin') return socket.emit('inviteNotAllowed', user.type);

    const transporter = await getMailTransporter();

    let sender = {
        username: user.username,
        email: user.email,
        room: user.room
    };

    invite.recipients.forEach(recipient => {
        let inviteInput = {id: recipient.id, email: recipient.email};
        logger.info(`service.mail.mailer.forEach.recipient`, recipient.email);
        sender.to = recipient.email;
        let formattedMessage = formatMail(sender);
        transporter.sendMail(formattedMessage, (err, info) => {
            if(err) {
                logger.info("service.mail.mailer.forEach.recipient.sendMail.inviteSendError:", err);
                return socket.emit('inviteSendFailure', inviteInput);
            }

            logger.info("service.mail.mailer.forEach.recipient.sendMail.success: Message sent: %s", info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

            // Preview only available when sending through an Ethereal account
            logger.info("service.mail.mailer.forEach.recipient.sendMail.success: Preview URL: %s", nodemailer.getTestMessageUrl(info));

            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
            if(info.accepted.length > 0) return socket.emit('inviteSendSuccess', inviteInput);
            if(info.rejected.length > 0) {
                logger.info("service.mail.mailer.forEach.recipient.sendMail.inviteSendFailure:", info.response);
                socket.emit('inviteSendFailure', inviteInput);
            }


        });
    });
}

async function getMailTransporter() {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });
}

function formatMail(sender) {
    //let recipients = sender.recipients.join(', ');
    return {
       // from: `"${sender.username}" <${sender.email}>`, // sender address
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
            to: sender.to, // message recipient (could be an array)
        subject: "Sasquatch Chat Invite", // Subject line
        //text: "Hello world?", // plain text body
        html: //TODO Add Sasquatch Chat logo to top of email
            "<h1>You're invited to join a Sasquatch Chat</h1>" +
            //"<p>Follow these steps to join the chat:</p>" +
            //"<ul><li>1. Click on the link below<li>2. Paste the encrypted message into the message box<li>3. Use your pre-arranged passcode to decrypt your chatroom id and room password.</ul>" +
            //"<h2><u>Your Encryptid Invitation</u></h2>" +
            `<p>Room ID: ${sender.room}</p>`
        //TODO password protect rooms `<p>Password: ${sender.room.password}</p>` // html body
        //TODO Create Option to Decline Invitation
    }
}

module.exports = mailer;