const logger = require('../loaders/logger');
const fs = require('fs');
let {messages, rooms, users} = require('../data/data');

module.exports = class DataRecovery {

    constructor() {
        this.onShutdown();
    }

    onStartup() {
            logger.info("[handlers.dataRecovery.onStartup]", {message: "Checking for data file..."});
            if(this._dataFileExists()) {
                logger.info("[handlers.dataRecovery.onStartup]", {message: "Data file found"});
                let rawdata = this._loadDataFromFile();
                this._setData(rawdata);
                this._deleteDataFile();
            }
    }

    onShutdown() {
        process.on('exit', (code) => {
            logger.info("[handlers.dataRecovery.onShutdown]", {message: "NodeJs Shutting Down", code});
            this._createDataRecoveryFile();
        });
    }

    _createDataRecoveryFile() {
        if(this._dataFileExists()) this._deleteDataFile();
        let recoveryData = this._buildDataObject();
        this._saveDataFile(recoveryData);
    }

    _dataFileExists() {
        return fs.existsSync('../data/data.json');
    }

    _loadDataFromFile() {
        logger.info("[handlers.dataRecovery._loadDataFromFile]", {message: "Loading data from file..."});
        try {
            const data = fs.readFileSync('../data/data.json', 'utf8')
            logger.info("[handlers.dataRecovery._loadDataFromFile]", {message: "File loaded", data});
            return JSON.parse(data);
        } catch (err) {
            logger.info("[handlers.dataRecovery._loadDataFromFile]", {message: "Problem reading from file"});
        }
    }

    _setData(rawdata) {
        logger.info("[handlers.dataRecovery._setData]", {message: "Data file found, setting data...", rawdata});
        this._setMessages(rawdata.messages);
        this._setRooms(rawdata.rooms);
        this._setUsers(rawdata.users);
        logger.info("[handlers.dataRecovery._setData]", {message: "Data set", messages, rooms, users});
    }

    _setMessages(messagesData) {
        logger.info("[handlers.dataRecovery._setData]", {message: "Setting messages..."});
        messagesData.forEach(message => {
            messages.push(message);
        })
        logger.info("[handlers.dataRecovery._setData]", {message: "Messages set", messages});
    }

    _setRooms(roomsData) {
        logger.info("[handlers.dataRecovery._setData]", {message: "Setting rooms..."});
        roomsData.forEach(room => {
            rooms.push(room);
        })
        logger.info("[handlers.dataRecovery._setData]", {message: "Rooms set", rooms});
    }

    _setUsers(usersData) {
        logger.info("[handlers.dataRecovery._setData]", {message: "Setting users..."
        });
        usersData.forEach(user => {
            users.push(user);
        })
        logger.info("[handlers.dataRecovery._setData]", {message: "Users set", users});
    }

    _deleteDataFile() {
        logger.info("[handlers.dataRecovery._deleteDataFile]", {message: "Deleting data file..."});
        fs.unlink('../data/data.json', (err)=> {
            if(err) throw err;
            console.log('Recovery file deleted!');
        })
    }

    _buildDataObject() {
        logger.info("[handlers.dataRecovery._buildDataObject]", {message: "Building data object..."});
        return {
            messages,
            users,
            rooms
        }
    }

    _saveDataFile(data) {
        logger.info("[handlers.dataRecovery._saveDataFile]", {message: "Saving data file..."});
        let json = JSON.stringify(data); //convert it back to json
        fs.writeFile('../data/data.json', json, 'utf8', err => {
            if(err) throw err;
            logger.info("[handlers.dataRecovery._saveDataFile]", {message: "Recovery file written!"});
        });
    }
}

