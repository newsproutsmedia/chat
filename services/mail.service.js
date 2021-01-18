const logger = require('../loaders/logger');
const nodemailer = require('nodemailer');
const userRepository = require('../repositories/user.repository');
const userService = require('../services/user.service');
const SocketEmitter = require('../emitters/socketEmitter');

const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

/**
 * @desc takes an array of recipients to construct an email
 * @param {Object} - object containing recipients, socket, io
 */
module.exports = class Mail {

    constructor({recipients, socket, io}) {
        this.socket = socket;
        this.io = io;
        this.socketIO = {socket, io};
        this.recipients = recipients;
        this.user = userRepository.getCurrentUserById(this.socket.id);
        this.sender = {
            username: this.user.username,
            email: this.user.email,
            room: this.user.room
        };
    }

    async sendAll() {

        if(this.user.type !== 'admin') return this._emitMailNotAllowed();

        let emailTransporter = await this._getMailTransporter();

        this.recipients.forEach(recipient => {
            let mailRecipient = {id: recipient.id, email: recipient.email};
            logger.info(`[service.mail.sendAll.forEach.recipient]`, {email: recipient.email});
            this.sender.to = recipient.email;
            let formattedMessage = this._formatMail(this.sender);
            emailTransporter.sendMail(formattedMessage, (err, info) => {

                if(err || info.rejected.length > 0) {
                    logger.error("[service.mail.sendAll.forEach.recipient.sendMail.inviteSendProblem]", {"id": mailRecipient.id, "email": mailRecipient.email});
                    this._emitInviteSendFailure(mailRecipient);
                    return;
                }

                logger.info("[service.mail.sendAll.forEach.recipient.sendMail.inviteSendSuccess]", {"info": info.response});
                userService.createUser({username: mailRecipient.email, email: mailRecipient.email, room: this.sender.room, type: "user"});
                userService.sendRoomUsers(this.sender.room, this.socketIO);
            });
        });

    }

    _emitMailNotAllowed() {
        logger.warn("[service.mail.emitInviteSendSuccess]", {"message": "email not allowed"});
        new SocketEmitter(this.socketIO).emitEventToSender('inviteNotAllowed', this.user.type);
    }

    _emitInviteSendFailure(recipient) {
        logger.warn("[service.mail.emitInviteSendFailure]", {"message": "send failed"});
        new SocketEmitter(this.socketIO).emitEventToSender('inviteSendFailure', recipient);
    }

    // create reusable transporter object using the default SMTP transport
    _getMailTransporter = async () => {
        const oauth2Client = new OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            "https://developers.google.com/oauthplayground"
        );

        oauth2Client.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN
        });

        const accessToken = await this._getGoogleAccessToken(oauth2Client);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: process.env.EMAIL,
                accessToken,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN
            }
        });

        return transporter;
    }

    _formatMail(sender) {
        //let recipients = sender.recipients.join(', ');
        return {
            // from: `"${sender.username}" <${sender.email}>`, // sender address
            from: process.env.EMAIL, // sender address
            to: sender.to, // message recipient (could be an array)
            subject: "ChatApp Invite", // Subject line
            //text: "You received this from ChatApp" // plain text body
            html: //TODO Add Sasquatch Chat logo to top of email
                `<h1>${this.sender.username} invited you to join a Chat</h1>` +
                `<p>Click on the link below, then enter a nickname to join the chat:</p>` +
                `<p><a href="http://localhost:3000/join?email=${sender.to}&room=${sender.room}">http://localhost:3000/join?email=${sender.to}&room=${sender.room}</a></p>` +
                `<p>Room ID: ${sender.room}</p>`
            //TODO password protect rooms `<p>Password: ${sender.room.password}</p>` // html body
            //TODO Create Option to Decline Invitation
        }
    }

    _getGoogleAccessToken(oAuth2Client) {
        return new Promise((resolve, reject) => {
            oAuth2Client.getAccessToken((err, token) => {
                if (err) {
                    logger.warn("service.mail.getGoogleAccessToken", {"message": err});
                    reject();
                }
                resolve(token);
            });
        });
    }
}