import { DashboardListeners } from "./chat/listeners/dashboardListeners";
import { MessageInputListeners } from "./chat/listeners/messageInputListeners";
import { SocketListeners } from "./chat/listeners/socketListeners";

// add DOM listeners
new DashboardListeners();
new MessageInputListeners();

// add socket listeners
new SocketListeners();







