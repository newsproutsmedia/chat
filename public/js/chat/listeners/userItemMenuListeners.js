import {emitBlockUser} from "../emitters/socketEmitters.js";

    export function addDisconnectUserButtonListener(id) {
        const disconnectUserButton = document.getElementById(`${id}-disconnect`);
        disconnectUserButton.addEventListener('click', kickOutUser);
    }

    function kickOutUser(evt) {
        const socketId = evt.currentTarget.getAttribute('data-value');
        const username = evt.currentTarget.getAttribute('data-username');
        const email = evt.currentTarget.getAttribute('data-email');
        if (confirm(`Block ${username}(${email})?`)) emitBlockUser(socketId);
    }
