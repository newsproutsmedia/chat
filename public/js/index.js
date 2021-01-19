$(function() {
    // Initialize variables

    const $loginPage = $('.pages'); // The login page
    const $usernameField = $('#usernameField');
    const $usernameInput = $('#usernameInput'); // Input for username
    const $usernameBtn = $('#usernameBtn'); // Input for username
    const $joinBtn = $('#joinBtn'); // Input for join
    const $emailField = $('#emailField');
    const $emailInput = $('#emailInput'); // Input for username

    let $currentInput = $usernameInput.focus();

    let username;

    // Focus input when clicking anywhere on login page
    $loginPage.on('click', () => {
        $currentInput.focus();
    });

    let user = {};

    $joinBtn.on('click', () => {
       window.location.href="/join";
    });

    $usernameBtn.on('click', () => {
        console.log('username button clicked');
        // get username from input
        username = cleanInput($usernameInput.val().trim());
        // validate username
        // add to user object
        user.username = username;
        // show next step
        nextField($usernameField, $emailField, $emailInput);
    });

    // Prevents input from having injected markup
    const cleanInput = (input) => {
        return $('<div/>').text(input).html();
    }

    const nextField = (thisField, nextField, nextInput) => {
        thisField.fadeOut(400, ()=> {
            nextField.fadeIn(400, ()=> {
                thisField.off('click');
                $currentInput = nextInput.focus();
            });
        });

    }

});