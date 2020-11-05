import { DashboardListeners } from "./chat/listeners/dashboardListeners";
import { MessageInputListeners } from "./chat/listeners/messageInputListeners";
import { SocketListeners } from "./chat/listeners/socketListeners";

// add DOM listeners for Dashboard and Message Input
new DashboardListeners();
new MessageInputListeners();

// add Socket.IO listeners
new SocketListeners();







