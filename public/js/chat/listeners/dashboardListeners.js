const showDash = document.getElementById('show-dash');
const hideDash = document.getElementById('hide-dash');

export class DashboardListeners {
    constructor() {
        this.showDashListener();
        this.hideDashListener();
    }

    showDashListener() {
        showDash.addEventListener('click', function () {
            console.log('showing dash...');
            document.getElementById('dashboard').style.display = 'block';
        });
    }

    hideDashListener() {
        hideDash.addEventListener('click', function () {
            console.log('hiding dash...');
            document.getElementById('dashboard').style.display = 'none';
        });
    }

}