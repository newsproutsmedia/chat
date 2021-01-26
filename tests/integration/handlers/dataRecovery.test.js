const supertest = require('supertest');
const logger = require('../../../loaders/logger');
const fs = require('fs');
let {messages, rooms, users} = require('../../../data/data');
const DataRecovery = require('../../../handlers/dataRecovery');

jest.mock('fs');

// create data file with bootstrap data
const data = {
    messages: [{test: "messagesTest"}, {test: "messagesTest2"}],
    users: [{test: "usersTest"}],
    rooms: [{test: "roomsTest"}]
}

describe('chat /', () => {
    let server;

    beforeEach( async () => {
        server = require('../../../server');
    });

    afterEach(async (done) => {

        try {
            await server.close();
            done();
        } catch(error) {
            console.log('You did something wrong!', error);
            throw error;
        }
    });

// do startup test
    it('should read data file if one exists', done => {
        fs.existsSync.mockReturnValue(true);
        //fs.readFile.mockReturnValue();
        fs.readFileSync.mockReturnValue(JSON.stringify(data));

        //WHEN
        server.listen(3000, () => {
            logger.info(`Server is running!`, {port: 3000, mode: `${process.env.NODE_ENV}`});
            new DataRecovery().onStartup();
            expect(messages[0].test).toBe("messagesTest");
            expect(rooms[0].test).toBe("roomsTest");
            expect(users[0].test).toBe("usersTest");
            expect(fs.unlink).toHaveBeenCalled();
            done();
        });

    })



// do exit test
    it('should write data file on process.exit', done => {
        //GIVEN
        fs.writeFile.mockImplementation(()=>{});

        //WHEN
        server.listen(3000, () => {
            logger.info(`Server is running!`, {port: 3000, mode: `${process.env.NODE_ENV}`});
            new DataRecovery()._createDataRecoveryFile();
            expect(fs.writeFile).toHaveBeenCalled();
            done();
        });

    });

});



