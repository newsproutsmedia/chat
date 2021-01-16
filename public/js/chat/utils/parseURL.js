export function getURLParams() {
    let str = window.location.pathname;
    return str.split("/");
}