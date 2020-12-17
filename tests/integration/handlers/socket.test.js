const io = require('socket.io-client');
const uuid = require('uuid');
const logger = require('../../../loaders/logger');
const PORT = process.env.PORT || 3000;
const socketURL = `http://localhost:${PORT}`;
const appName = process.env.PORT || "ChatApp";

let options = {
        transports: ['websocket'],
        'force new connection': true
    };

let chatUser1;
let chatUser2;

let client1;
let client2;

const uniqueRoomId = 'f930702a-687c-4d0b-bdad-ccbb04eebdbd';
// mock entire uuid module, but only allow overwriting of v4 function
jest.mock("uuid", () => ({
    ...jest.requireActual("uuid"),
    v4: jest.fn()
}));

describe("Socket.IO Server-Side Events", () => {

    describe("joinRoom", () => {
        let server;

        beforeEach(done => {
            chatUser1 = {username: 'Tom', email: 'tom@tom.com'};
            chatUser2 = {username: 'Sally', email: 'sally@sally.com'};
            uuid.v4.mockReturnValueOnce(uniqueRoomId);
            server = require('../../../server').server;
            done();
        });

        afterEach(done => {
            setTimeout(() => done(), 1000);
        })

        function validateRoom(room) {
            return uuid.validate(room);
        }

        it('should emit welcome message to new user when they join a room', done => {
            client1 = io.connect(socketURL, options);

            client1.once('connect', () => {
                client1.once('message', message => {
                    expect(message.user.username).toBe(appName);
                    expect(message.user.type).toBe("bot");
                    expect(message.text).toBeTruthy();
                    expect(message.time).toBeTruthy();
                    client1.disconnect();
                    done();
                });

                client1.emit('joinRoom', chatUser1);
            });
        });

        it('should broadcast to existing users when a new user joins room', async (done) => {

            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('message', message => {

                });

                client1.emit('joinRoom', chatUser1);

                client2 = io.connect(socketURL, options);
                client2.on('connect', data => {
                    chatUser2.room = uniqueRoomId;
                    logger.info("chatUser2 room:", chatUser2.room);
                    client1.once('message', message => {
                        expect(message.text).toBe(`${chatUser2.username} has joined the chat`);
                        client1.disconnect();
                        client2.disconnect();
                        done();
                    });
                    client2.emit('joinRoom', chatUser2);
                });
            });

        });

        it('should emit roomCreated with a valid room id when first user joins a room', done => {
            client1 = io.connect(socketURL, options);
            client1.once('connect', () => {
                client1.once('roomCreated', room => {
                    expect(validateRoom(room)).toBeTruthy();
                    client1.disconnect();
                    done();
                });

                client1.emit('joinRoom', chatUser1);
            });
        });

        it('should emit invalidRoom with room id when an invalid room id is passed when user joins', done => {
            chatUser1.room = 1234;
            client1 = io.connect(socketURL, options);
            client1.once('connect', () => {
                client1.once('invalidRoom', room => {
                    expect(validateRoom(room)).toBeFalsy();
                    client1.disconnect();
                    done();
                });

                client1.emit('joinRoom', chatUser1);
            });
        });

        it('should emit room id and array of users to all room sockets on user join', done => {
            client1 = io.connect(socketURL, options);
            client1.once('connect', () => {
                client1.once('roomUsers', users => {
                    expect(validateRoom(users.room)).toBeTruthy();
                    expect(users.users[0].id).toBeTruthy();
                    expect(users.users.length > 0).toBeTruthy();
                    client1.disconnect();
                    done();
                });

                client1.emit('joinRoom', chatUser1);
            });
        }, 5000);

        it('should emit setupAdmin with user object if user is admin', done => {
            client1 = io.connect(socketURL, options);
            client1.once('connect', () => {
                client1.once('setupAdmin', user => {
                    expect(user.id).toBeTruthy();
                    expect(user.username).toBe(chatUser1.username);
                    expect(validateRoom(user.room)).toBeTruthy();
                    expect(user.email).toBe(chatUser1.email);
                    expect(user.messageCount).toBe(0);
                    expect(user.status).toBe("ONLINE");
                    expect(user.type).toBe("admin");
                    client1.disconnect();
                    done();
                });

                client1.emit('joinRoom', chatUser1);
            });
        });

        it('should emit message history when a new user joins', done => {
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('message', message => {
                    // welcome message
                    client1.emit('chatMessage', {text: 'test message'});
                });

                client1.emit('joinRoom', chatUser1);

                client2 = io.connect(socketURL, options);
                client2.on('connect', data => {
                    chatUser2.room = uniqueRoomId;
                    client2.once('message', message => {
                        // welcome message
                        client2.once('message', message => {
                            // message history
                            expect(message.text).toBe('test message');
                            client1.disconnect();
                            client2.disconnect();
                            done();
                        });
                    });
                    client2.emit('joinRoom', chatUser2);
                });
            });
        });

    });

    describe("chatMessage", () => {
        let server;

        beforeEach(done => {
            chatUser1 = {username: 'Tom', email: 'tom@tom.com'};
            chatUser2 = {username: 'Sally', email: 'sally@sally.com'};
            uuid.v4.mockReturnValueOnce(uniqueRoomId);
            server = require('../../../server').server;
            done();
        });

        afterEach(done => {
            setTimeout(() => done(), 1000);
        })

        it('should emit message back to sender on message event', done => {
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('message', message => {
                    client1.once('message', message => {
                        expect(message.text).toBe("Hello, World!");
                        client1.disconnect();
                        done();
                    });

                    client1.emit('chatMessage', {text: "Hello, World!"});
                });

                client1.emit('joinRoom', chatUser1);
            });
        });

        it('should broadcast message to other users on message event', done => {
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {

                client1.emit('joinRoom', chatUser1);

                client2 = io.connect(socketURL, options);
                client2.on('connect', data => {
                    chatUser2.room = uniqueRoomId;
                    logger.info("chatUser2 room:", chatUser2.room);
                    client2.once('message', message => {
                        client2.once('message', message => {
                            expect(message.text).toBe("Hello, World!");
                            client1.disconnect();
                            client2.disconnect();
                            done();
                        });
                        client1.emit('chatMessage', {text: "Hello, World!"});
                    });
                    client2.emit('joinRoom', chatUser2);
                });
            });
        });
        it('should emit updateMessageCount and increment sender message count by 1', done => {
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('message', message => {
                    client1.once('updatedMessageCount', messageCount => {
                        expect(messageCount.count).toBe(1);
                        client1.disconnect();
                        done();
                    });

                    client1.emit('chatMessage', {text:"Hello, World!"});
                });

                client1.emit('joinRoom', chatUser1);
            });
        });
    });

    describe("emailInvite", () => {

        beforeEach(done => {
            chatUser1 = {username: 'Tom', email: 'tom@tom.com'};
            chatUser2 = {username: 'Sally', email: 'sally@sally.com'};
            uuid.v4.mockReturnValueOnce(uniqueRoomId);
            server = require('../../../server').server;
            done();
        });

        afterEach(done => {
            setTimeout(() => done(), 1000);
        })

        it('should emit inviteNotAllowed if user is not admin', done => {
            let invite = {
                recipients: [{id: "id", email: "test@test.com"}]
            }
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {

                client1.emit('joinRoom', chatUser1);

                client2 = io.connect(socketURL, options);
                client2.on('connect', data => {
                    chatUser2.room = uniqueRoomId;
                    client2.once('inviteNotAllowed', userType => {
                        expect(userType !== 'admin').toBeTruthy();
                        client1.disconnect();
                        client2.disconnect();
                        done();
                    });
                    client2.once('message', message => {
                        client2.emit('emailInvite', invite);
                    });
                    client2.emit('joinRoom', chatUser2);
                });
            });
        });
        it('should emit inviteSendFailure if there was a problem sending an email', done => {
            // Bad email address
            let invite = {
                recipients: [{id: "id", email: "test-error"}]
            }
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('inviteSendFailure', inviteInput => {
                    expect(inviteInput.id).toBe("id");
                    client1.disconnect();
                    done();
                });
                client1.once('message', message => {
                   client1.emit('emailInvite', invite);
                });

                client1.emit('joinRoom', chatUser1);
            });
        }, 10000);

        it('should emit inviteSendSuccess email was successfully sent', done => {
            let invite = {
                recipients: [{id: "id", email: "test-success@test.com"}]
            }
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('inviteSendSuccess', inviteInput => {
                    expect(inviteInput.id).toBe("id");
                    expect(inviteInput.email).toBe("test-success@test.com");
                    client1.disconnect();
                    done();
                });
                client1.once('message', message => {
                    client1.emit('emailInvite', invite);
                });

                client1.emit('joinRoom', chatUser1);
            });
        }, 10000);

    });

    describe('disconnect', () => {
        let server;

        beforeEach(done => {
            chatUser1 = {username: 'Tom', email: 'tom@tom.com'};
            chatUser2 = {username: 'Sally', email: 'sally@sally.com'};
            uuid.v4.mockReturnValueOnce(uniqueRoomId);
            server = require('../../../server').server;
            done();
        });

        afterEach(done => {
            setTimeout(() => done(), 2000);
        });

        it('should notify remaining chat participants that a user left', done => {
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('message', message => {
                    // welcome message
                    client1.once('message', message => {
                        client1.once('message', message => {
                            expect(message.text).toBe(`${chatUser2.username} has left the chat`);
                            client1.disconnect();
                            done();
                        });
                    });
                });

                client1.emit('joinRoom', chatUser1);

                client2 = io.connect(socketURL, options);
                client2.on('connect', data => {
                    chatUser2.room = uniqueRoomId;
                    client2.once('message', message => {
                        client2.disconnect();
                    });
                    client2.emit('joinRoom', chatUser2);
                });
            });
        });
        it('should send updated users and room info when a user leaves', done => {
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('roomUsers', roomUsers => {
                    expect(roomUsers.room).toBe(uniqueRoomId);
                    expect(roomUsers.users.length).toBe(1);
                    client1.disconnect();
                    done();
                });

                client1.emit('joinRoom', chatUser1);

                client2 = io.connect(socketURL, options);
                client2.on('connect', data => {
                    chatUser2.room = uniqueRoomId;
                    client2.once('message', message => {
                        // welcome message
                        client2.disconnect();
                    });
                    client2.emit('joinRoom', chatUser2);
                });
            });
        });
    });

    describe('uncaughtException test', () => {
        let server;

        beforeEach(done => {
            chatUser1 = {username: 'Tom', email: 'tom@tom.com'};
            chatUser2 = {username: 'Sally', email: 'sally@sally.com'};
            uuid.v4.mockReturnValueOnce(uniqueRoomId);
            server = require('../../../server').server;
            done();
        });

        afterEach(done => {
            setTimeout(() => done(), 1000);
        });

        function myFunc(condition){
            if(condition){
                process.emit('uncaughtException', new Error);
            }
        }

        it('should catch an unhandled exception', done => {
            const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('message', message => {
                    myFunc(true);
                    expect(mockExit).toHaveBeenCalledWith(1);
                    client1.disconnect();
                    done();
                });

                client1.emit('joinRoom', chatUser1);
            });
        });
    });

    describe('blockUser', () => {
        let server;

        beforeEach(done => {
            chatUser1 = {username: 'Tom', email: 'tom@tom.com'};
            chatUser2 = {username: 'Sally', email: 'sally@sally.com'};
            uuid.v4.mockReturnValueOnce(uniqueRoomId);
            server = require('../../../server').server;
            done();
        });

        afterEach(done => {
            setTimeout(() => done(), 2000);
        });

        it('should set status of ejected user to BLOCKED', done => {
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('message', message => {
                    // welcome message
                    client1.once('message', message => {
                        // client 2 has joined message
                        client1.once('roomUsers', roomUsers => {
                            const client2socket = roomUsers.users[1].id;
                            client1.once('roomUsers', roomUsers => {
                                expect(roomUsers.users[1].status).toBe("BLOCKED");
                                client1.disconnect();
                                client2.disconnect();
                                done();
                            });

                            // emit kickOutUser
                            client1.emit('blockUser', client2socket);
                        });
                    });
                });

                client2 = io.connect(socketURL, options);
                client2.on('connect', data => {
                    chatUser2.room = uniqueRoomId;
                    client2.once('message', message => {
                        // welcome message
                    });
                    client2.emit('joinRoom', chatUser2);
                });
            });

            client1.emit('joinRoom', chatUser1);
        });

        it('should set user status to BLOCKED if user is already disconnected', done => {
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('message', message => {
                    // welcome message
                    logger.info('CLIENT 1: Welcome Message');
                    client1.once('message', message => {
                        // client 2 has joined message
                        logger.info('CLIENT 1: Client 2 has joined');
                        client1.once('message', message => {
                            // client 2 has disconnected
                            logger.info('CLIENT 1: Client 2 has left');
                            client1.once('roomUsers', roomUsers => {
                                logger.info('CLIENT 1: Room users updated');
                                const client2socket = roomUsers.users[1].id;
                                client1.once('roomUsers', roomUsers => {
                                    logger.info('CLIENT 1: Room users updated after kick out');
                                    expect(roomUsers.users[1].status).toBe("BLOCKED");
                                    client1.disconnect();
                                    done();
                                });

                                // emit kickOutUser
                                client1.emit('blockUser', client2socket);
                            });
                        })

                    });
                });

                client2 = io.connect(socketURL, options);
                client2.on('connect', data => {
                    chatUser2.room = uniqueRoomId;
                    client2.once('message', message => {
                        // welcome message
                        client2.disconnect();
                    });
                    client2.emit('joinRoom', chatUser2);
                });
            });

            client1.emit('joinRoom', chatUser1);
        });

        it('should log out blocked user', done => {
            let client2socket;
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('message', () => {
                    // welcome message
                    client1.once('message', () => {
                        // client 2 has joined message
                        client1.once('roomUsers', roomUsers => {
                            client2socket = roomUsers.users[1].id;
                            // emit kickOutUser
                            client1.emit('blockUser', client2socket);
                        });
                    });
                });

                client2 = io.connect(socketURL, options);
                client2.on('connect', data => {
                    chatUser2.room = uniqueRoomId;
                    client2.once('logoutUser', message => {
                        console.log("logoutUser received", message);
                        expect(message).toBe("userBlocked");
                        client1.disconnect();
                        client2.disconnect();
                        done();
                    });

                    client2.emit('joinRoom', chatUser2);
                });
            });

            client1.emit('joinRoom', chatUser1);
        });

    });
});

