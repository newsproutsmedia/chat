import {outputInviteSection} from "./invitations";
import {InviteListeners} from "./listeners/inviteListeners";

let isAdmin = false;

export function getIsAdmin() {
    return isAdmin;
}

export function setIsAdmin(bool) {
    isAdmin = bool;
    return isAdmin;
}

export function setupAdmin(user) {
    setIsAdmin(true);
    outputInviteSection(user);
    new InviteListeners();
}

