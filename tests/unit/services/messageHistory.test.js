const MessageHistory = require('../../../services/messageHistory');

describe('messageHistory', ()=> {

    test('it should return false if no existing messages', done => {
        jest.spyOn(MessageHistory, 'getRoomMessages').mockImplementation(() => {});
        const rooms = new MessageHistory().sendMessageHistoryToUser('test', {socket: "test", io: "test"});
        expect(rooms).toBeFalsy();
        done();
    });

    test('it should delete room messages', done => {
        const room1Message =
            {
                user: {
                    id: "1",
                    username: "test1",
                    room: "room1",
                    email: "email1",
                    messageCount: 1,
                    status: "active",
                    type: "user"
                },
                text: "test message room 1"
            };
        const room2Message =
            {
                user: {
                    id: "2",
                    username: "test2",
                    room: "room2",
                    email: "email2",
                    messageCount: 1,
                    status: "active",
                    type: "user"
                },
                text: "test message room 2"
            }
        MessageHistory.addMessageToHistory(room1Message);
        MessageHistory.addMessageToHistory(room2Message);
        expect(MessageHistory.deleteRoomMessages("room2")).toEqual(
            expect.arrayContaining([
                expect.objectContaining({text: "test message room 1"})
            ])
        );
        done();
    });

});