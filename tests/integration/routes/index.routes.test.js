const supertest = require('supertest');

describe('home /', () => {
    let server;
    let chatUser1 = {username: 'Tom', email: 'tom@tom.com'};
    let chatUser2 = {username: 'Sally', email: 'sally'};

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

    it('returns 200 when home page is requested', async () => {

        await supertest(server)
            .get('/')
            .expect(200)
    })

    it('returns 302 when user data is valid', async () => {

        await supertest(server)
            .post('/')
            .send(chatUser1)
            .expect(302)
    });

    it('returns 200 when user data is NOT valid', async () => {

        await supertest(server)
            .post('/')
            .send(chatUser2)
            .expect(200)
    });
})