export function removeElementById(elementId) {
    const element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}