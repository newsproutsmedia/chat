import {messageBtnSend, messageBtnDefault, messageBtnId, messageBtnOk, setButtonState, submitMessage} from "../messages.js";
import {userAgentIsMobile} from "../utils/detectUserAgent.js";

const messageInput = document.getElementById('msg');
const messageForm = document.getElementById('messageForm');
const messageSubmitBtn = document.getElementById('messageSubmitBtn');

export class MessageInputListeners {
    constructor() {
        this.messageInputBlurListener();
        this.messageInputFocusListener();
        this.messageSubmitButtonClickListener();
        this.messageInputEnterListener();
        this.messageSubmitButtonEnterListener();
    }

    messageInputBlurListener() {
        messageInput.addEventListener('blur', () => {
            window.scrollTo(0, 0);
            if (document.getElementById('msg').value !== "") {
                return setButtonState(messageBtnId, messageBtnSend, [messageBtnDefault, messageBtnOk], false);
            }
            setButtonState(messageBtnId, messageBtnSend, [messageBtnDefault, messageBtnOk], true);
        });
    };

    messageInputFocusListener() {
        if(userAgentIsMobile()) {
            messageInput.addEventListener('click', () => {
                console.log('click: input field in focus');
                messageInput.focus();
                setButtonState(messageBtnId, messageBtnOk, [messageBtnDefault, messageBtnSend], false);
            });
        } else {
            messageInput.addEventListener('focus', () => {
                console.log('focus: input field in focus')
                setButtonState(messageBtnId, messageBtnOk, [messageBtnDefault, messageBtnSend], false);
            });
        }
    };

    messageSubmitButtonClickListener() {
        console.log('click: submit button');
        messageSubmitBtn.addEventListener('click', submitMessage);
    };

    messageSubmitButtonEnterListener() {
        messageSubmitBtn.addEventListener("keydown", function(event) {
            console.log('message submit keydown');
            if (event.code === 'Enter') {
                return false;
            }
        });
        messageSubmitBtn.addEventListener("keyup", function(event) {
            console.log('message submit keyup');
            if (event.code === 'Enter') {
                return false;
            }
        });
    };

    messageInputEnterListener() {
        messageForm.addEventListener("keydown", function(event) {
            if (event.code === 'Enter') {
                event.preventDefault();
            }
        });
        messageInput.addEventListener("keyup", function(event) {
            if (event.code === 'Enter') {
                event.preventDefault();
                messageSubmitBtn.click();
            }
        });

    }
}