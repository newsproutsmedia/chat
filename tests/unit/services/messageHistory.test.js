const MessageHistory = require('../../../services/messageHistory');

describe('messageHistory', ()=> {

    test('should return false if no existing messages', done => {
        jest.spyOn(MessageHistory, 'getRoomMessages').mockImplementation(() => {});
        const rooms = new MessageHistory().sendMessageHistoryToUser('test', {socket: "test", io: "test"});
        expect(rooms).toBeFalsy();
        done();
    });

})