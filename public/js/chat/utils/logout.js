export function logout(message) {
        window.location.replace(`/?loggedOut=true&message=${message}`);
}