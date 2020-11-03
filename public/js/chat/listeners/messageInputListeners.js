// recipient email field typing listener
/// when typing stops, perform email validation
/// if email is valid, activate "Send Invitations" button
messageInput.addEventListener('blur', () => {
    window.scrollTo(0, 0);
    if(document.getElementById('msg').innerHTML != "") {
        return setButtonState(messageBtnId, messageBtnSend,[messageBtnDefault, messageBtnOk], false);
        // setSendButtonDisabled(false);
        // return activeSendButton();
    }
    setButtonState(messageBtnId, messageBtnDefault,[messageBtnSend, messageBtnOk], true);
});

messageInput.addEventListener('focus', () => {
    setTimeout(() => {
        setButtonState(messageBtnId, messageBtnOk,[messageBtnDefault, messageBtnSend], false);
        // activeOkButton();
        // setSendButtonDisabled(false);
        let diffHeight = initHeight - window.innerHeight;
        document.getElementById('msg').style.content = diffHeight.toString();
        window.scrollTo(0, diffHeight);
    }, 200);
});