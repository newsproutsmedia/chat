import {emitChatMessage} from "./emitters/socketEmitters.js";
import {userAgentIsMobile} from "./utils/detectUserAgent.js";

const chatMessages = document.getElementById('main');
export const messageBtnId = 'messageSubmitBtn';
export const messageBtnIconId = 'messageBtnIcon';
export const messageBtnDefault = {id: messageBtnId, style: 'btn-default', icon: {id: messageBtnIconId, style: 'default-message-btn-icon'}};
export const messageBtnSend = {id: messageBtnId, style: 'btn-send', icon: {id: messageBtnIconId, style: 'send-message-btn-icon'}};
export const messageBtnOk = {id: messageBtnId, style: 'btn-ok', icon: {id: messageBtnIconId, style: 'ok-message-btn-icon'}};
const messageInput = document.getElementById('msg');

export function clearMessages() {
    document.querySelector('.chat-messages').innerHTML = "";
}

/**
 * @description get text from message input and send to back end
 */
export function submitMessage() {
    // close keyboard on mobile "return" submit
    messageInput.blur();

    // get message from "chat-form"
    // form has an id of "msg", so we're getting the value of that input
    let message = {text: messageInput.value};

    // Emit message to server
    emitChatMessage(message);

    // Clear form
    messageInput.value = "";

    // If desktop, set focus to message input
    setMessageInputFocus();

    // Scroll to top of page
    window.scrollTo(0, 0);
}

/**
 * @description add state and icon to specified button
 * @param {Object} state
 */
export function addButtonState(state) {
    // add button style
    document.getElementById(state.id).classList.add(state.style);
    // add icon
    document.getElementById(state.icon.id).classList.add(state.icon.style);
}

/**
 * @description remove state and icon to specified button
 * @param {Object} state
 */
export function removeButtonState(state) {
    // remove button style
    document.getElementById(state.id).classList.remove(state.style);
    // remove icon
    document.getElementById(state.icon.id).classList.remove(state.icon.style);
}

/**
 * @description set new state for multiple button objects
 * @param {string} id
 * @param {Object} state
 * @param {array} removeStates array of elements to remove states from
 * @param {boolean} isDisabled
 */
export function setButtonState(id, state, removeStates, isDisabled) {
    toggleDisabled(id, isDisabled);
    for(let remove of removeStates) {
        removeButtonState(remove);
    }
    addButtonState(state);
}

/**
 * @description add/remove "link-disabled" class
 * @param {string} id
 * @param {boolean} isDisabled
 */
function toggleDisabled(id, isDisabled) {
    if(isDisabled) return document.getElementById(id).classList.add("link-disabled");
    document.getElementById(id).classList.remove("link-disabled");
}

/**
 * @description send message window to bottom when new message arrives
 * @param {Element} messageWindowId
 */
export function scrollMessageWindowToBottom(messageWindowId) {
    // Scrolls down automatically
    console.log('original scrollTop: ' + messageWindowId.scrollHeight);
    console.log('original scrollHeight:' + messageWindowId.scrollHeight);
    //TODO instead of scrolling automatically, bring up a clickable arrow at bottom of message window that says "New Messages"
    messageWindowId.scrollTop = messageWindowId.scrollHeight;
    console.log('new scrollTop: ' + messageWindowId.scrollHeight);
    console.log('new scrollHeight:' + messageWindowId.scrollHeight);
}

/**
 * @description output message to DOM
 * @param {Object} message - sending user object and text string
 * @param {string} username - username of current socket
 */
export function outputMessage(message, username) {
    if(message.user.type === 'bot') return outputBotMessage(message); // if bot, send bot-style message
    const div = document.createElement('div');
    div.classList.add('message');
    if(message.user.username === username) div.classList.add('own');
    div.innerHTML = `<p class="meta">${message.user.username}<span class="timestamp">${message.time}</span></p>
                <p class="text">
                    ${message.text}
                </p>`;
    document.querySelector('.chat-messages').appendChild(div);

    scrollMessageWindowToBottom(chatMessages);
}

/**
 * @description output message from system (bot)
 * @param {Object} message - bot object and text string
 */
export function outputBotMessage(message) {
    const div = document.createElement('div');
    div.classList.add('bot-message');
    div.innerHTML = `<b>${message.user.username}: </b>${message.text}`;
    document.querySelector('.chat-messages').appendChild(div);
}

/**
 * @description output updated message count to DOM
 * @param messageCount
 */
export function outputUpdatedMessageCount(messageCount) {
    document.getElementById(`${messageCount.userId}-count`).innerHTML = messageCount.count;
}

function setMessageInputFocus() {
    if(userAgentIsMobile()) {
        setButtonState(messageBtnId, messageBtnSend, [messageBtnDefault, messageBtnOk], true);
    } else {
        messageInput.focus();
    }
}