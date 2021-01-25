const nav = document.getElementById('navMenu');
const showMenuBtn = document.getElementById('showMenu');
const hideMenuBtn = document.getElementById('hideMenu');

{
    addResizeListener();
    outputPageDimensions();
    addShowHideDashListeners();
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