import {loremIpsum} from "./utils/loremIpsum.js";

const nav = document.getElementById('navMenu');
const lorem = document.getElementById('lorem');
const loremBtn = document.getElementById('loadLoremBtn');
const showMenuBtn = document.getElementById('showMenu');
const hideMenuBtn = document.getElementById('hideMenu');

{
    addLoremButtonEventListener();
    addResizeListener();
    outputPageDimensions();
    addShowHideDashListeners();
}

function addLoremButtonEventListener() {
    loremBtn.addEventListener('click', addLorem);
}

export function addLorem() {
    lorem.innerHTML = loremIpsum;
    loremBtn.removeEventListener('click', addLorem);
    loremBtn.innerText = "Lorem Loaded";
    loremBtn.setAttribute('disabled', "");
    hideMenu();
}

function addResizeListener() {
    window.addEventListener('resize', outputPageDimensions);
}

function outputPageDimensions() {
    const pageWidth = document.getElementById('pageWidth');
    const pageHeight = document.getElementById('pageHeight');
    pageWidth.innerHTML = String(document.documentElement.scrollWidth);
    pageHeight.innerHTML = String(document.documentElement.scrollHeight);
}

function addShowHideDashListeners() {
    showMenuBtn.addEventListener('click', showMenu);
    hideMenuBtn.addEventListener('click', hideMenu);
}

function showMenu() {
    showMenuBtn.classList.add('h-hidden');
    hideMenuBtn.classList.remove('h-hidden');
    nav.classList.add('menu');
    addMenuResizeListener();
}

function hideMenu() {
    hideMenuBtn.classList.add('h-hidden');
    showMenuBtn.classList.remove('h-hidden');
    nav.classList.remove('menu');
    removeMenuResizeListener();
}

function addMenuResizeListener() {
    window.addEventListener('resize', closeMenuOnResize);
}

function removeMenuResizeListener() {
    window.removeEventListener('resize', closeMenuOnResize);
}

function closeMenuOnResize() {
    if(document.documentElement.scrollWidth > 749) {
        hideMenu();
    }
}