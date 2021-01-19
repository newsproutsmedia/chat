import {getIsAdmin} from "./admin.js";
import {logout} from "./utils/logout.js";

export function redirectToError() {
    alert("An error occurred. Please wait a second and try again.");
}

export function systemCrash(message) {
    if(getIsAdmin()) {
        alert("A system crash has occurred. All connected users will be logged out. Chat administrators will need to create a new chat and re-invite all participants. Sorry for the inconvenience.");
    } else {
        alert("A system crash has occurred. All connected users will be logged out. Please check your email shortly for a new invite from your chat administrator. Sorry for the inconvenience.");
    }
    logout(message);
}