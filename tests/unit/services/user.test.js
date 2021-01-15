const User = require('../../../models/user');

describe('test user', () => {

    test('should return "user" if type not valid', done => {
        const userType = User.setType('test');
        expect(userType).toBe('user');
        done();
    });

});