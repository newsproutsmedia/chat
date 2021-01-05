import {outputInviteSection} from "./invitations.js";
import {outputDashboardMenu} from "./dashboard.js";

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
    outputDashboardMenu();
    outputInviteSection(user);
}

