// output message to DOM
export function outputMessage(message) {
    if(message.user.type === 'bot') return outputBotMessage(message); // if bot, send bot-style message
    const div = document.createElement('div');
    div.classList.add('message');
    if(message.user.username === username) div.classList.add('own');
    div.innerHTML = `<p class="meta">${message.user.username}<span class="timestamp">${message.time}</span></p>
                <p class="text">
                    ${message.text}
                </p>`;
    document.querySelector('.chat-messages').appendChild(div);

    scrollMessageWindowToBottom("chatMessages");
}

export function scrollMessageWindowToBottom(messageWindowId) {
    // Scrolls down automatically
    //TODO instead of scrolling automatically, bring up a clickable arrow at bottom of message window that says "New Messages"
    messageWindowId.scrollTop = messageWindowId.scrollHeight;
}

export function outputBotMessage(message) {
    const div = document.createElement('div');
    div.classList.add('bot-message');
    div.innerHTML = `<b>${message.user.username}: </b>${message.text}`;
    document.querySelector('.chat-messages').appendChild(div);
}

// add message to list
export function addMessage() {

    // get message from "chat-form"
    // form has an id of "msg", so we're getting the value of that input
    let message = {text: document.getElementById('msg').innerHTML};

    // Emit message to server
    socket.emit('chatMessage', message);

    // Clear input
    document.getElementById('msg').innerHTML = '';
    document.getElementById('msg').style.content = 'Enter Message';
    // Set focus to message input
    // document.getElementById('msg').focus();

    // Scroll to top of page
    window.scrollTo(0, 0);
    // disable button
    setButtonState(messageBtnId, messageBtnDefault, [messageBtnSend, messageBtnOk], true);

    // update user message count


}




export function addButtonState(state) {
    // add button style
    document.getElementById(state.id).classList.add(state.style);
    // add icon
    document.getElementById(state.icon.id).classList.add(state.icon.style);
}

export function removeButtonState(state) {
    // remove button style
    document.getElementById(state.id).classList.remove(state.style);
    // remove icon
    document.getElementById(state.icon.id).classList.remove(state.icon.style);
}

export function setButtonState(id, state, removeStates, isDisabled) {
    document.getElementById(id).disabled = isDisabled;
    for(let remove of removeStates) {
        removeButtonState(remove);
    }
    addButtonState(state);
}

// Update user message count
export function updateMessageCount(messageCount) {
    document.getElementById(`${messageCount.userId}-count`).innerHTML = messageCount.count;
}