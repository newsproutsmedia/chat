import {emitKickOutUser} from "../emitters/socketEmitters.js";

    export function addDisconnectUserButtonListener(id) {
        const disconnectUserButton = document.getElementById(`${id}-disconnect`);
        disconnectUserButton.addEventListener('click', kickOutUser);
    }

    export function removeDisconnectUserButtonListeners(users) {
        users.forEach(user => {
            const disconnectButton = document.getElementById(`${user.id}-disconnect`);
            disconnectButton.removeEventListener('click', kickOutUser);
        });
    }

    function kickOutUser(evt) {
        emitKickOutUser(evt.currentTarget.getAttribute('data-value'));
    }
