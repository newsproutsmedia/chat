const logger = require('../loaders/logger');
const fs = require('fs');
let {messages, rooms, users} = require('../data/data');

/**
 * @description handles data recovery in case of unexpected nodejs shutdown
 */
module.exports = class DataRecovery {

    constructor() {
        this.onShutdown();
    }

    /**
     * @description on node startup, check if data file exists and process if it does
     */
    onStartup() {
            logger.info("[handlers.dataRecovery.onStartup]", {message: "Checking for data file..."});
            if(this._dataFileExists()) {
                logger.info("[handlers.dataRecovery.onStartup]", {message: "Data file found"});
                let rawdata = this._loadDataFromFile();
                this._setData(rawdata);
                this._deleteDataFile();
            }
    }

    /**
     * @description on unexpected node exit handler
     */
    onShutdown() {
        process.on('exit', (code) => {
            logger.info("[handlers.dataRecovery.onShutdown]", {message: "NodeJs Shutting Down", code});
            this._createDataRecoveryFile();
        });
    }

    /**
     * @description create data recovery file
     */
    _createDataRecoveryFile() {
        if(this._dataFileExists()) this._deleteDataFile();
        let recoveryData = this._buildDataObject();
        this._saveDataFile(recoveryData);
    }

    /**
     * @description check if data file exists
     * @returns {boolean} fileExists
     */
    _dataFileExists() {
        return fs.existsSync('../data/data.json');
    }

    /**
     * @description if data file exists, parse it
     * @returns {Object} data
     */
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

    /**
     * @description split raw data file into separate handlers
     */
    _setData(rawdata) {
        logger.info("[handlers.dataRecovery._setData]", {message: "Data file found, setting data...", rawdata});
        this._setMessages(rawdata.messages);
        this._setRooms(rawdata.rooms);
        this._setUsers(rawdata.users);
        logger.info("[handlers.dataRecovery._setData]", {message: "Data set", messages, rooms, users});
    }

    /**
     * @description persist message data
     */
    _setMessages(messagesData) {
        logger.info("[handlers.dataRecovery._setData]", {message: "Setting messages..."});
        messagesData.forEach(message => {
            messages.push(message);
        })
        logger.info("[handlers.dataRecovery._setData]", {message: "Messages set", messages});
    }

    /**
     * @description persist room data
     */
    _setRooms(roomsData) {
        logger.info("[handlers.dataRecovery._setData]", {message: "Setting rooms..."});
        roomsData.forEach(room => {
            rooms.push(room);
        })
        logger.info("[handlers.dataRecovery._setData]", {message: "Rooms set", rooms});
    }

    /**
     * @description persist user data
     */
    _setUsers(usersData) {
        logger.info("[handlers.dataRecovery._setData]", {message: "Setting users..."
        });
        usersData.forEach(user => {
            users.push(user);
        })
        logger.info("[handlers.dataRecovery._setData]", {message: "Users set", users});
    }

    /**
     * @description delete recovery file
     */
    _deleteDataFile() {
        logger.info("[handlers.dataRecovery._deleteDataFile]", {message: "Deleting data file..."});
        fs.unlink('../data/data.json', (err)=> {
            if(err) throw err;
            console.log('Recovery file deleted!');
        })
    }

    /**
     * @description build recovery data object
     * @returns {Object} recoveryData
     */
    _buildDataObject() {
        logger.info("[handlers.dataRecovery._buildDataObject]", {message: "Building data object..."});
        return {
            messages,
            users,
            rooms
        }
    }

    /**
     * @description save data object to file
     * @param {Object} data
     */
    _saveDataFile(data) {
        logger.info("[handlers.dataRecovery._saveDataFile]", {message: "Saving data file..."});
        let json = JSON.stringify(data); //convert it back to json
        fs.writeFile('../data/data.json', json, 'utf8', err => {
            if(err) throw err;
            logger.info("[handlers.dataRecovery._saveDataFile]", {message: "Recovery file written!"});
        });
    }
}

