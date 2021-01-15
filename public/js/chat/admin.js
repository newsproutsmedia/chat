import {setupInviteSection} from "./invitations.js";
import {setupDashboardMenu} from "./dashboard.js";

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
    setupDashboardMenu();
    setupInviteSection();
}

