const supertest = require('supertest');

const roomService = require('../../../services/room.service');
const userService = require('../../../services/user.service');

let { users } = require('../../../data/users.data');
let { rooms } = require('../../../data/rooms.data');
let { messages } = require('../../../data/messages.data');

describe('chat /', () => {
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

    afterEach(async (done) => {

        try {
            await server.close();
            done();
        } catch(error) {
            console.log('You did something wrong!', error);
            throw error;
        }
    });

    it('returns 404 when incorrect parameters are passed', async () => {
        zeroOutData();
        await supertest(server)
            .get('/chat')
            .expect(404)
    });

    it('returns 200 when user successfully enters chat', async () => {
        zeroOutData();
        const {id: roomId} = roomService.createRoom();
        chatUser1 = connectUser(chatUser1, roomId, "admin");

        await supertest(server)
            .get(`/chat/${roomId}/${chatUser1.email}/${chatUser1.username}`)
            .expect(200)
    });

    it('returns 302 when user data is invalid', async () => {
        zeroOutData();
        const {id: roomId} = roomService.createRoom();
        chatUser1 = connectUser(chatUser1, roomId, "admin");
        chatUser2 = connectUser(chatUser2, roomId, "user");

        await supertest(server)
            .get(`/chat/${roomId}/${chatUser3.email}/${chatUser3.username}`)
            .expect(302)
    });
})