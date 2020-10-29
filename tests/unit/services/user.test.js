const User = require('../../../services/user');

describe('test user', () => {

    it('should return "user" if type not valid', done => {
        const userType = User.setUserType('test');
        expect(userType).toBe('user');
        done();
    });

});