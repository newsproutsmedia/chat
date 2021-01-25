const roomRepository = require('../../../repositories/room.repository');
const messageRepository = require('../../../repositories/message.repository');
const userRepository = require('../../../repositories/user.repository');
const roomService = require('../../../services/room.service');

let room = "test";

describe('destroy room', () => {

    function bootstrapData() {
        messageRepository.addMessageToHistory({id: 1, user: {id: 2, room: "test"}});
        roomRepository.addRoom("test");
        userRepository.addUser({id: 1, room: "test"});
    }


    it('should delete all room references from persistence', done => {
        const userSpy = jest.spyOn(userRepository, "deleteAllUsersFromRoom");
        const roomSpy = jest.spyOn(roomRepository, "deleteRoom");
        const messageSpy = jest.spyOn(messageRepository, "deleteMessagesByRoom");

        bootstrapData();

        roomService.destroyRoom(room);
        expect(userSpy).toHaveLength(0);
        expect(roomSpy).toHaveLength(0);
        expect(messageSpy).toHaveLength(0);

        done();
    });

});