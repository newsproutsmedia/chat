import {logout} from "../utils/logout.js";

const showMenuBtn = document.getElementById('showMenu');
const hideMenuBtn = document.getElementById('hideMenu');
const logoutButton = document.getElementById('logoutBtn');
const nav = document.getElementById('navMenu');

export class MenuListeners {
    constructor() {
        this.addShowHideMenuListeners();
        this.logoutButtonListener();
    }

    addShowHideMenuListeners() {
        showMenuBtn.addEventListener('click', MenuListeners.showMenu);
        hideMenuBtn.addEventListener('click', MenuListeners.hideMenu);
    }

    static addMenuResizeListener() {
        console.log('adding resize listener');
        window.addEventListener('resize', MenuListeners.closeMenuOnResize);
    }

    static removeMenuResizeListener() {
        window.removeEventListener('resize', MenuListeners.closeMenuOnResize);
    }

    static showMenu() {
        showMenuBtn.classList.add('h-hidden');
        hideMenuBtn.classList.remove('h-hidden');
        nav.classList.add('menu');
        MenuListeners.addMenuResizeListener();
    }

    static hideMenu() {
        hideMenuBtn.classList.add('h-hidden');
        showMenuBtn.classList.remove('h-hidden');
        nav.classList.remove('menu');
        MenuListeners.removeMenuResizeListener();
    }

    static closeMenuOnResize() {
        if(document.documentElement.scrollWidth > 749) {
            MenuListeners.hideMenu();
        }
    }

    logoutButtonListener() {
        logoutButton.addEventListener('click', logout);
    }

}