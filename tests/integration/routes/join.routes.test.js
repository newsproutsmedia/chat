const supertest = require('supertest');

const roomService = require('../../../services/room.service');
const userService = require('../../../services/user.service');

let { users, rooms, messages } = require('../../../data/data');

describe('join /', () => {
    let server;
    let chatUser1 = {username: 'Tom', email: 'tom@tom.com'};
    let chatUser2 = {username: 'Sally', email: 'sally@sally.com'};
    let chatUser3 = {username: 'Baduser', email: 'bad@email.com'};

    function connectUser(user, room, type) {
        userService.createUser({...user, room: room, type: type});
        return {...user, room: room};
    }

    function zeroOutData() {
        users = [];
        rooms = [];
        messages = [];
    }

    beforeEach( async () => {
        server = require('../../../server');
    });

    afterAll(async (done) => {

        try {
            await server.close();
            done();
        } catch(error) {
            console.log('You did something wrong!', error);
            throw error;
        }
    });

    it('returns 200 when join page is requested', async () => {
        await supertest(server)
            .get('/join')
            .expect(200)
    });

    it('returns 200 when user successfully joins room', async () => {
        zeroOutData();
        const {id: roomId} = roomService.createRoom();
        chatUser1 = connectUser(chatUser1, roomId, "admin");
        chatUser2 = connectUser(chatUser2, roomId, "user");

        await supertest(server)
            .post('/join')
            .send(chatUser2)
            .expect(302)
    });

    it('returns 403 when user data is invalid', async () => {
        zeroOutData();
        const {id: roomId} = roomService.createRoom();
        chatUser1 = connectUser(chatUser1, roomId, "admin");
        chatUser2 = connectUser(chatUser2, roomId, "user");

        await supertest(server)
            .post('/join')
            .send(chatUser3)
            .expect(403)
    });
})