import {getIsAdmin} from "./admin.js";

const menu = document.getElementById('viewMenu');
const chatIcon = {id: "chatIcon", fontAwesome: "fa-comments", section: "messagePanel"};
const roomIcon = {id: "roomIcon", fontAwesome: "fa-door-closed", section: "room"};
const usersIcon = {id: "usersIcon", fontAwesome: "fa-user-friends", section: "users"};
const inviteIcon = {id: "inviteIcon", fontAwesome: "fa-paper-plane", section: "invite"};

export function outputDashboardMenu() {

    outputMenuIcon(chatIcon, true);
    outputMenuIcon(roomIcon, false);
    outputMenuIcon(usersIcon, true);
    if(getIsAdmin()) outputMenuIcon(inviteIcon, true);

}

/**
 * @desc output icon to dashboard menu
 * @param {object} icon - id, fontAwesome, section
 * @param {string} icon.id - identifier to be used for icon id
 * @param {string} icon.fontAwesome - font awesome icon tag
 * @param {string} icon.section - id of menu section to be toggled by icon
 * @param {boolean} isSelected - is icon selected by default

 */
export function outputMenuIcon({id, fontAwesome, section}, isSelected) {
    let menuIcon = document.createElement('span');
    menuIcon.id = id;
    menuIcon.classList.add("view-menu-item");
    if(isSelected) menuIcon.classList.add("selected");
    menuIcon.innerHTML = `<i id="${id}-image" class="fas ${fontAwesome} fa-lg"></i>`;
    menuIcon.setAttribute("section", section);
    menu.appendChild(menuIcon);
    addMenuIconListener(id);
}

export function addMenuIconListener(id) {
    let listener = document.getElementById(id);
    listener.addEventListener('click', toggleMenuIcon);
}

export function toggleMenuIcon(event) {
    const menuItem = event.target.parentNode;
    if(menuItem.classList.contains("selected")) {
        menuItem.classList.remove("selected");
    } else {
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