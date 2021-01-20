import {getIsAdmin} from "./admin.js";
import {userAgentIsMobile} from "./utils/detectUserAgent.js";

const menu = document.getElementById('viewMenu');
const chatIcon = {id: "chatIcon", fontAwesome: "fa-comments", section: "messagePanel"};
const roomIcon = {id: "roomIcon", fontAwesome: "fa-door-closed", section: "room"};
const usersIcon = {id: "usersIcon", fontAwesome: "fa-user-friends", section: "users"};
const inviteIcon = {id: "inviteIcon", fontAwesome: "fa-paper-plane", section: "invite"};

export function setupDashboardMenu() {

    addMenuIconListener(chatIcon.id);
    addMenuIconListener(roomIcon.id);
    addMenuIconListener(usersIcon.id);
    if(getIsAdmin()) addMenuIconListener(inviteIcon.id);

}

export function addMenuIconListener(id) {
    let listener = document.getElementById(id);
    if(userAgentIsMobile()) {
        listener.addEventListener('touchend', toggleMenu);
    } else {
        listener.addEventListener('click', toggleMenu);
    }
}

export function toggleMenu(event) {
    toggleMenuIcon(event);
    toggleSection(event);
}

export function toggleMenuIcon(event) {
    const menuItem = event.target.parentNode;
    if(menuItem.classList.contains("selected")) {
        menuItem.classList.remove("selected");
        menuItem.classList.add("default");
    } else {
        menuItem.classList.remove("default");
        menuItem.classList.add("selected");
    }
    toggleSection(menuItem.getAttribute("section"));
}

export function toggleSection(section) {
    const dashSection = document.getElementById(section);
    if(dashSection.classList.contains("h-hidden")) {
        dashSection.classList.remove("h-hidden");
    } else {
        dashSection.classList.add("h-hidden");
    }
}