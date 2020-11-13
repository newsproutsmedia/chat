import {socket} from "./socketListeners.js";

export class UserItemMenuListeners {
    constructor(id) {
        this.socketId = id;
        this.disconnectUserButton = document.getElementById(`${id}-disconnect`);
        this.addDisconnectUserButtonListener();
    }

    addDisconnectUserButtonListener() {
        this.disconnectUserButton.addEventListener('click', ()=> {
            socket.emit('kickOutUser', this.socketId);
        })
    }
}