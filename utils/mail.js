"use strict";
const nodemailer = require('nodemailer');

// async..await is not allowed in global scope, must use a wrapper
async function mailer(sender) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });

    let formattedMessage = formatMail(sender);

    // send mail with defined transport object
    let info = await transporter.sendMail(formattedMessage);

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

function formatMail(sender) {
    //let recipients = sender.recipients.join(', ');
    let formattedMail = {
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
            to: sender.recipients, // list of receivers
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

    return formattedMail;
}

module.exports = mailer;