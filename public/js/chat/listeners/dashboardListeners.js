import {logout} from "../utils/logout.js";


export class DashboardListeners {
    constructor() {
        this.showDash = document.getElementById('show-dash');
        this.hideDash = document.getElementById('hide-dash');
        this.logoutButton = document.getElementById('logoutBtn');
        this.showDashListener();
        this.hideDashListener();
        this.logoutButtonListener();
    }

    showDashListener() {
        this.showDash.addEventListener('click', function () {
            console.log('showing dash...');
            document.getElementById('dashboard').style.display = 'block';
        });
    }

    hideDashListener() {
        this.hideDash.addEventListener('click', function () {
            console.log('hiding dash...');
            document.getElementById('dashboard').style.display = 'none';
        });
    }

    logoutButtonListener() {
        this.logoutButton.addEventListener('click', logout);
    }

}