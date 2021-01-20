const logger = require('../loaders/logger');
const fs = require('fs');
let {messages, rooms, users} = require('../data/data');

module.exports = class DataRecovery {

    constructor(app) {
        this.app = app;
        this.onStartup();
        this.onShutdown();
    }

    onStartup() {
        this.app.on('listening', async () => {
            if(this._dataFileExists()) {
                let rawdata = await this._loadDataFromFile()
                    .then(()=>{this._setData(rawdata)})
                    .then(()=>{this._deleteDataFile()});
            }
        });
    }

    onShutdown() {
        process.on('exit', (code) => {
            logger.info("[socket.connection.event.process.exit]", {message: "NodeJs Shutting Down", code});
            let recoveryData = this._buildDataObject();
            this._saveDataFile(recoveryData);
        });
    }

    _dataFileExists() {
        return fs.existsSync('../data/data.json');
    }

    async _loadDataFromFile() {
        await fs.readFile('data.json', 'utf8', function readFileCallback(err, data) {
            if(err) {
                console.log(err);
            } else {
                return JSON.parse(data);
            }
        });
    }

    _setData(rawdata) {
        messages = rawdata.messages;
        rooms = rawdata.rooms;
        users = rawdata.users;
    }

    _deleteDataFile() {
        fs.unlink('../data/data.json', (err)=> {
            if(err) throw err;
            console.log('Recovery file deleted!');
        })
    }

    _buildDataObject() {
        return {
            messages,
            users,
            rooms
        }

    }

    _saveDataFile(data) {
        let json = JSON.stringify(data); //convert it back to json
        fs.writeFile('../data/data.json', json, 'utf8', err => {
            if(err) throw err;
            console.log('Recovery file written!')
        });
    }
}

