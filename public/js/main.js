import { DashboardListeners } from "./chat/listeners/dashboardListeners.js";
import { MessageInputListeners } from "./chat/listeners/messageInputListeners.js";
import { SocketListeners } from "./chat/listeners/socketListeners.js";

// add DOM listeners for Dashboard and Message Input
new DashboardListeners();
new MessageInputListeners();

// add Socket.IO listeners
new SocketListeners();







