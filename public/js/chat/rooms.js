/**
 * @description output room name to the dom
 * @param {Element} elementId - id of wrapper element
 * @param {string} room - room id
 */
export function outputRoomName(elementId, room) {
    elementId.innerText = room;
}

/**
 * @description add "room" param to URL
 * @param {string} room - room id
 */
export function updateUrlRoom(room) {
    let thisURL = window.location.href;
    window.history.replaceState(null, null, `${thisURL}&room=${room}`);
    console.log(window.location.href + '&room=' + room);
}