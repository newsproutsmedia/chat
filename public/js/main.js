import { MenuListeners } from "./chat/listeners/menuListeners.js";
import { MessageInputListeners } from "./chat/listeners/messageInputListeners.js";
import { SocketListeners } from "./chat/listeners/socketListeners.js";

$(document).ready(function() {
// add DOM listeners for Dashboard and Message Input
    new MenuListeners();
    new MessageInputListeners();

// add Socket.IO listeners
    new SocketListeners();
});







