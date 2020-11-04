import {outputInviteSection} from "./invitations";

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
}

