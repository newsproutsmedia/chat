const roomRepository = require('../../../repositories/room.repository');
const roomService = require('../../../services/room.service');

jest.mock('../../../data/data', () => {
    return {
        rooms: []
    }
});

let room = "testRoom";

describe('delete room', () => {

    function resetData() {
        rooms = [];
    }

    function bootstrapData() {
        rooms.push({id: "testRoom"});
        rooms.push({id: "testRoom2"});
    }

    it('should delete all users from a room', done => {
        resetData();
        bootstrapData();

        roomRepository.deleteRoom("testRoom");
        expect(rooms).toHaveLength(1);

        resetData();
        done();
    });
});