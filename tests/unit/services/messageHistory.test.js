const messageRepository = require('../../../repositories/message.repository');
const messageService = require('../../../services/message.service');

describe('messageHistory', ()=> {

    test('it should return false if no existing messages', done => {
        jest.spyOn(messageRepository, 'getMessagesByRoom').mockImplementation(() => {});
        const rooms = messageService.sendMessageHistoryToUser('test', {socket: "test", io: "test"});
        expect(rooms).toBeFalsy();
        done();
    });

    test('it should delete room messages', done => {
        const room1Message =
            {
                user: {
                        id: "1",
                        username: "user1",
                        room: "room1",
                        email: "email1",
                        messageCount: 1,
                        status: "ONLINE",
                        type: "admin"
                    },
                text: "test message room 1"
            };
        const room2Message =
            {
                user: {
                    id: "2",
                    username: "user2",
                    room: "room2",
                    email: "email2",
                    messageCount: 1,
                    status: "ONLINE",
                    type: "admin"
                },
                text: "test message room 2"
            };
        messageRepository.addMessageToHistory(room1Message);
        messageRepository.addMessageToHistory(room2Message);
        expect(messageRepository.deleteMessagesByRoom("room2")).toEqual(
            expect.arrayContaining([
                expect.objectContaining({text: "test message room 1"})
            ])
        );
        done();
    });

});
