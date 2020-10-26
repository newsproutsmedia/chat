const logger = require('./logger');
const nodemailer = require('nodemailer');
const User = require('./user');

module.exports = class Mail {

    constructor({recipients, socket, io}) {
        this.socket = socket;
        this.io = io;
        this.recipients = recipients;
        this.user = User.getCurrentUser(this.socket.id);
        this.sender = {
            username: this.user.username,
            email: this.user.email,
            room: this.user.room
        }
    }

    async sendAll() {

        if(this.user.type !== 'admin') return this._emitMailNotAllowed();

        const transporter = await this._getMailTransporter();

        this.recipients.forEach(recipient => {
            let mailRecipient = {id: recipient.id, email: recipient.email};
            logger.info(`service.mail.sendAll.forEach.recipient`, {email: recipient.email});
            this.sender.to = recipient.email;
            let formattedMessage = this._formatMail(this.sender);
            transporter.sendMail(formattedMessage, (err, info) => {
                if(err) {
                    logger.info("service.mail.sendAll.forEach.recipient.sendMail.inviteSendError:", {error: err});
                    return this._emitInviteSendFailure(mailRecipient);
                }

                logger.info("service.mail.sendAll.forEach.recipient.sendMail.success: Message sent: %s", {info: info.messageId});
                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

                // Preview only available when sending through an Ethereal account
                logger.info("service.mail.sendAll.forEach.recipient.sendMail.success: Preview URL: %s", {info: nodemailer.getTestMessageUrl(info)});

                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                if(info.accepted.length > 0) {
                    logger.info("service.mail.sendAll.forEach.recipient.sendMail.inviteSendSuccess:", {info: info.response});
                    return this._emitInviteSendSuccess(mailRecipient);
                }
                if(info.rejected.length > 0) {
                    logger.info("service.mail.sendAll.forEach.recipient.sendMail.inviteSendFailure:", {info: info.response});
                    return this._emitInviteSendFailure(mailRecipient);
                }


            });
        });

    }

    _emitMailNotAllowed() {
        this.socket.emit('inviteNotAllowed', this.user.type);
    }

    _emitInviteSendFailure(recipient) {
        this.socket.emit('inviteSendFailure', recipient);
    }

    _emitInviteSendSuccess(recipient) {
        this.socket.emit('inviteSendSuccess', recipient);
    }

    async _getMailTransporter() {
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

    _formatMail(sender) {
        //let recipients = sender.recipients.join(', ');
        return {
            // from: `"${sender.username}" <${sender.email}>`, // sender address
            from: '"Fred Foo 👻" <foo@example.com>', // sender address
            to: sender.to, // message recipient (could be an array)
            subject: "Sasquatch Chat Invite", // Subject line
            //text: "Hello world?", // plain text body
            html: //TODO Add Sasquatch Chat logo to top of email
                "<h1>You're invited to join a Chat</h1>" +
                //"<p>Follow these steps to join the chat:</p>" +
                //"<ul><li>1. Click on the link below<li>2. Paste the encrypted message into the message box<li>3. Use your pre-arranged passcode to decrypt your chatroom id and room password.</ul>" +
                //"<h2><u>Your Encryptid Invitation</u></h2>" +
                `<p>Room ID: ${sender.room}</p>`
            //TODO password protect rooms `<p>Password: ${sender.room.password}</p>` // html body
            //TODO Create Option to Decline Invitation
        }
    }
}