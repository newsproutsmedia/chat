// Get username and room from URL
export let { email, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true // ignores non key/value data
});

export function validateUrlParams() {
    // check that email and room are set in the url
    if(emailParamIsValid() && roomParamIsValid()) {
        outputHiddenInput("joinForm", "email", email);
        outputHiddenInput("joinForm", "room", room);
    }

    // if good, display form with only username input
    // if problems, display alternate login with error message and fields for username, email, and room
}

export function emailParamIsValid() {
    if(!email) return false;
    return true;
}

export function roomParamIsValid() {
    if(!room) return false;
    return true;
}

export function outputHiddenInput(parent, id, inputValue) {
    const hiddenElement = document.createElement('input');
    hiddenElement.type = "hidden";
    hiddenElement.id = id;
    hiddenElement.name = id;
    hiddenElement.value = inputValue;

    document.getElementById(parent).prepend(hiddenElement);
}

/**
 * @desc display username-only form
 */
export function displayUsernameForm() {

}

/**
 * @desc display full login form with all fields
 */
export function displayFullLoginForm() {

}

/**
 * @desc display error message
 * @param message
 */
export function outputErrorMessage(message) {

}

/**
 * @desc highlight field where there is an error
 * @param id - id of field element where there is an error
 */
export function outputInputFieldErrorHighlight(id) {

}