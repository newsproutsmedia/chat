const roomRepository = require('../../../repositories/room.repository');
const messageRepository = require('../../../repositories/message.repository');
const userRepository = require('../../../repositories/user.repository');
const roomService = require('../../../services/room.service');
let { messages } = require('../../../data/data');
let { rooms } = require('../../../data/data');
let { users } = require('../../../data/data');

let room = "test";

describe('destroy room', () => {

    function resetData() {
        messages = [];
        rooms = [];
        users = [];
    }

    function bootstrapData() {
        messages.push({id: 1, user: {id: 2, room: "test"}});
        rooms.push({id: "test"});
        users.push({id: 1, room: "test"});
    }


    it('should delete all room references from persistence', done => {
        const userSpy = jest.spyOn(userRepository, "deleteAllUsersFromRoom").mockImplementation(()=> {});
        const roomSpy = jest.spyOn(roomRepository, "deleteRoom").mockImplementation(()=> {});
        const messageSpy = jest.spyOn(messageRepository, "deleteMessagesByRoom").mockImplementation(()=> {});

        resetData();
        bootstrapData();

        roomService.destroyRoom(room);
        expect(userSpy).toHaveBeenCalled();
        expect(roomSpy).toHaveBeenCalled();
        expect(messageSpy).toHaveBeenCalled();

        resetData();
        done();
    });

});