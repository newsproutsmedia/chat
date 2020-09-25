$(function() {
    // Initialize variables
    const $window = $(window);
    const $usernameInput = $('#usernameInput'); // Input for username
    const $loginPage = $('.pages'); // The login page
    const $currentInput = $usernameInput.focus();

    // Focus input when clicking anywhere on login page
    $loginPage.click(() => {
        $currentInput.focus();
    });

});