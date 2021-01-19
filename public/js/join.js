$(function() {
    console.log('this is working');

    const $joinLogoLink = $('#joinLogoLink');

    $joinLogoLink.css('cursor', 'pointer');

    $joinLogoLink.on('click', () => {
        window.location="/";
    })

});