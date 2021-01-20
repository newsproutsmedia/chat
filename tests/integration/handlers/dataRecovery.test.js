const supertest = require('supertest');
const logger = require('../../../loaders/logger');
const fs = require('fs');
let {messages, rooms, users} = require('../../../data/data');
const DataRecovery = require('../../../handlers/dataRecovery');

// create data file with bootstrap data
const data = {
    messages: {
        test: "messagesTest"
    },
    users: {
        test: "usersTest"
    },
    rooms: {
        test: "roomsTest"
    }
}

function bootstrapFile() {
    let json = JSON.stringify(data); //convert it back to json
    fs.writeFile('../../../data/data.json', json, 'utf8', err => {
        if(err) throw err;
        console.log('Recovery file written!')
    });
}

describe('chat /', () => {

// do startup test

// delete data file

// do exit test

});



