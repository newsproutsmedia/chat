const userRepository = require('../../../repositories/user.repository');

describe('test user', () => {

    test('should return "user" if type not valid', done => {
        const userType = userRepository.setType('test');
        expect(userType).toBe('user');
        done();
    });

});