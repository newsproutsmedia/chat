import {messageBtnSend, messageBtnDefault, messageBtnId, messageBtnOk, setButtonState, submitMessage} from "../messages";
const initHeight = window.innerHeight;
const messageInput = document.getElementById('msg');
const messageSubmitBtn = document.getElementById('messageSubmitBtn');

export class MessageInputListeners {
    constructor() {
        this.messageInputBlurListener();
        this.messageInputFocusListener();
        this.messageSubmitButtonListener();
    }

    messageInputBlurListener() {
        messageInput.addEventListener('blur', () => {
            window.scrollTo(0, 0);
            if (document.getElementById('msg').innerHTML !== "") {
                return setButtonState(messageBtnId, messageBtnSend, [messageBtnDefault, messageBtnOk], false);
                // setSendButtonDisabled(false);
                // return activeSendButton();
            }
            setButtonState(messageBtnId, messageBtnDefault, [messageBtnSend, messageBtnOk], true);
        });
    };

    messageInputFocusListener() {
        messageInput.addEventListener('focus', () => {
            setTimeout(() => {
                setButtonState(messageBtnId, messageBtnOk, [messageBtnDefault, messageBtnSend], false);
                // activeOkButton();
                // setSendButtonDisabled(false);
                let diffHeight = initHeight - window.innerHeight;
                document.getElementById('msg').style.content = diffHeight.toString();
                window.scrollTo(0, diffHeight);
            }, 200);
        });
    };

    messageSubmitButtonListener() {
        messageSubmitBtn.addEventListener('click', submitMessage);
    };

}