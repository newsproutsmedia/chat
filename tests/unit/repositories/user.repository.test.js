const userRepository = require('../../../repositories/user.repository');

describe('test user', () => {

    it('should return "user" if type not valid', done => {
        const userType = userRepository.setType('test');
        expect(userType).toBe('user');
        done();
    });

    it('should return "type" if type IS valid', done => {

        const userType = userRepository.setType('admin');
        expect(userType).toBe('admin');
        done();
    });

    it('should return "true" if user exists', done => {
        userRepository.addUser({id: 1, username: 'test', room: '1'});
        const userExists = userRepository.usernameExistsInRoom('1', 'test');
        expect(userExists).toBeTruthy();
        userRepository.deleteAllUsersFromRoom('1');
        done();
    })

});