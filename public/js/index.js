$(function() {
    // Initialize variables

    const $loginPage = $('.pages'); // The login page
    const $usernameField = $('#usernameField');
    const $loginForm = $('#loginForm');
    const $usernameInput = $('#usernameInput'); // Input for username
    const $usernameBtn = $('#usernameBtn'); // Input for username
    const $joinBtn = $('#joinBtn'); // Input for join
    const $emailField = $('#emailField');
    const $emailInput = $('#emailInput'); // Input for username
    const $emailBtn = $('#emailBtn'); // Input for username

    let $currentInput = $usernameInput.focus();

    let username;
    let email;
    let user = {};

    // Focus input when clicking anywhere on login page
    $loginPage.on('click', () => {
        $currentInput.focus();
    });

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
        if(username) {
            nextField($usernameField, $emailField, $emailInput);
        }
    });
    $emailBtn.on('click', () => {
        $emailBtn.preventDefault();
        console.log('email button clicked');
        // get username from input
        email = cleanInput($emailInput.val().trim());
        // validate username
        // add to user object
        user.email = email;
        // show next step
        if(IsEmail(email)) {
            $loginForm.submit();
        }
    });

    function IsEmail(email) {
        const regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if(!regex.test(email)) {
            console.log("invalid email");
            return false;
        }else{
            console.log("valid email");
            return true;
        }
    }

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