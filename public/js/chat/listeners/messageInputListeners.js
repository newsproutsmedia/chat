import {messageBtnSend, messageBtnDefault, messageBtnId, messageBtnOk, setButtonState, submitMessage} from "../messages.js";
const initHeight = window.innerHeight;
const messageInput = document.getElementById('msg');
const messageSubmitBtn = document.getElementById('messageSubmitBtn');

export class MessageInputListeners {
    constructor() {
        this.messageInputBlurListener();
        this.messageInputFocusListener();
        this.messageSubmitButtonListener();
        this.messageInputEnterListener();
    }

    messageInputBlurListener() {
        messageInput.addEventListener('blur', () => {
            window.scrollTo(0, 0);
            if (document.getElementById('msg').value !== "") {
                return setButtonState(messageBtnId, messageBtnSend, [messageBtnDefault, messageBtnOk], false);
            }
            setButtonState(messageBtnId, messageBtnDefault, [messageBtnSend, messageBtnOk], true);
        });
    };

    messageInputFocusListener() {
        messageInput.addEventListener('focus', () => {
            setButtonState(messageBtnId, messageBtnOk, [messageBtnDefault, messageBtnSend], false);
        });
    };

    messageSubmitButtonListener() {
        messageSubmitBtn.addEventListener('click', submitMessage);
    };

    messageInputEnterListener() {
        messageInput.addEventListener("keyup", function(event) {
            if (event.code === 'Enter') {
                event.preventDefault();
                messageSubmitBtn.click();
            }
        });
    }
}