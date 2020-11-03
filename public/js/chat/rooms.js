// Add room name to DOM
/**
 * @description output room name to the dom
 * @param {Element} elementId - id of wrapper element
 * @param {string} room - room id
 */
export function outputRoomName(elementId, room) {
    elementId.innerText = room;
}