export function logout(user) {
    if(user.status === "TERMINATED") {
        window.location.replace("/blocked.html")
    } else {
        window.location.replace("/index.html?loggedOut=true");
    }
}