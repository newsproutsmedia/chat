export function logout(message) {
        window.location.replace(`/index.html?loggedOut=true&message=${message}`);
}