// Add room name to DOM
/**
 * @description output room name to the dom
 * @param {Element} elementId - id of wrapper element
 * @param {string} room - room id
 */
export function outputRoomName(elementId, room) {
    elementId.innerText = room;
}

export function updateUrlRoom(room) {
    this.room = room;
    let thisURL = window.location.href;
    window.history.replaceState(null, null, `${thisURL}&room=${room}`);
    console.log(window.location.href + '&room=' + room);
}