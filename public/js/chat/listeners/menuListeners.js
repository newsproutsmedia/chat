import {logout} from "../utils/logout.js";

const showMenuBtn = document.getElementById('showMenu');
const hideMenuBtn = document.getElementById('hideMenu');
const logoutButton = document.getElementById('logoutBtn');
const logo = document.getElementById('logo');
const nav = document.getElementById('navMenu');

export class MenuListeners {
    constructor() {
        this.initializeMenu();
        this.addShowHideMenuListeners();
        this.addMenuResizeListener();
        this.logoutButtonListener();
    }

    initializeMenu() {
        if(document.documentElement.scrollWidth < 749) {
            nav.classList.add('menu');
            nav.classList.add('zz-middle');
            nav.classList.add('slideup');
        }
    }

    addShowHideMenuListeners() {
        showMenuBtn.addEventListener('click', MenuListeners.showMenu);
        hideMenuBtn.addEventListener('click', MenuListeners.hideMenu);
    }

    addMenuResizeListener() {
        console.log('adding resize listener');
        window.addEventListener('resize', MenuListeners.toggleMenuOnResize);
    }

    static removeMenuResizeListener() {
        window.removeEventListener('resize', MenuListeners.toggleMenuOnResize);
    }

    static showMenu() {
        console.log('showMenu triggered');
        MenuListeners.toggleMenuPosition();
        MenuListeners.showHideMenuBtn();
    }

    static hideMenu() {
        console.log('hideMenu triggered');
        MenuListeners.toggleMenuPosition();
        MenuListeners.showShowMenuBtn();

    }

    static showShowMenuBtn() {
        hideMenuBtn.classList.add('h-hidden');
        showMenuBtn.classList.remove('h-hidden');
    }

    static showHideMenuBtn() {
        hideMenuBtn.classList.remove('h-hidden');
        showMenuBtn.classList.add('h-hidden');
    }

    static toggleMenuPosition() {
        if(nav.classList.contains('slideup')) {
            console.log('sliding down!');
            nav.classList.remove('slideup');
            nav.classList.add('slidedown');
        } else if(nav.classList.contains('slidedown')) {
            console.log('sliding up!');
            nav.classList.remove('slidedown');
            nav.classList.add('slideup');
        } else {
            nav.classList.add('slidedown');
        }
    }

    static toggleMenuOnResize() {
        if(document.documentElement.scrollWidth > 749) {
            nav.classList.remove('menu');
            nav.classList.remove('zz-middle');
            nav.classList.remove('slideup');
            nav.classList.remove('slidedown');
            MenuListeners.showShowMenuBtn();
        } else {
            nav.classList.add('menu');
            nav.classList.add('zz-middle');
            nav.classList.add('slideup');
        }
    }

    logoutButtonListener() {
        logoutButton.addEventListener('click', logout);
    }

}