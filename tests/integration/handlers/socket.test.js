const io = require('socket.io-client');
const roomService = require('../../../services/room.service');
const userRepository = require('../../../repositories/user.repository');
const userService = require('../../../services/user.service');
const messageRepository = require('../../../repositories/message.repository');
const LogoutTimer = require('../../../services/logoutTimer.service');
const logger = require('../../../loaders/logger');
const globals = require('../../../loaders/globals');

const PORT = process.env.PORT || 4000;
const socketURL = `http://localhost:${PORT}`;
const appName = globals.getAppName();
const roomRepository = require('../../../repositories/room.repository');

let { users } = require('../../../data/users.data');
let { rooms } = require('../../../data/rooms.data');
let { messages } = require('../../../data/messages.data');

let options = {
        transports: ['websocket'],
        'force new connection': true
    };

let chatUser1;
let chatUser2;

let client1;
let client2;

let server;

describe("Socket.IO Server-Side Events", () => {

    function connectUser(user, room, type) {
        userService.createUser({...user, room: room, type: type});
        return {...user, room: room};
    }

    function zeroOutData() {
        users = [];
        rooms = [];
        messages = [];
    }

    beforeEach(async () => {
        chatUser1 = {username: 'Tom', email: 'tom@tom.com'};
        chatUser2 = {username: 'Sally', email: 'sally@sally.com'};
        server = require('../../../server');
        server.listen(PORT, () => {
            logger.info(`Server is running!`, {port: `${PORT}`, mode: `${process.env.NODE_ENV}`});
        });
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



    describe("joinRoom", () => {

        it('should emit welcome message to new user when they join a room', done => {
            const {id: roomId} = roomService.createRoom();
            chatUser1 = connectUser(chatUser1, roomId, "admin");

            client1 = io.connect(socketURL, options);

            client1.once('connect', () => {
                client1.once('message', message => {
                    expect(message.user.username).toBe(appName);
                    expect(message.user.type).toBe("bot");
                    expect(message.text).toBeTruthy();
                    expect(message.time).toBeTruthy();
                    client1.disconnect();
                    zeroOutData();
                    done();
                });

                client1.emit('joinRoom', chatUser1);
            });
        });

        it('should broadcast to existing users when a new user joins room', done => {
            const {id: roomId} = roomService.createRoom();
            chatUser1 = connectUser(chatUser1, roomId, "admin");
            chatUser2 = connectUser(chatUser2, roomId, "user");

            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('message', message => {

                });

                client1.emit('joinRoom', chatUser1);

                client2 = io.connect(socketURL, options);
                client2.on('connect', data => {
                    chatUser2.room = roomId;
                    logger.info("chatUser2 room:", chatUser2.room);
                    client1.once('message', message => {
                        expect(message.text).toBe(`${chatUser2.username} has joined the chat`);
                        client1.disconnect();
                        client2.disconnect();
                        zeroOutData();
                        done();
                    });
                    client2.emit('joinRoom', chatUser2);
                });
            });

        });

        it('should emit invalidRoom with room id when an invalid room id is passed when user joins', done => {
            const {id: roomId} = roomService.createRoom();
            chatUser1 = connectUser(chatUser1, roomId, "admin");
            chatUser1.room = 1234;
            client1 = io.connect(socketURL, options);
            client1.once('connect', () => {
                client1.once('invalidUser', user => {
                    expect(user.username).toBe("Tom");
                    client1.disconnect();
                    zeroOutData();
                    done();
                });

                client1.emit('joinRoom', chatUser1);
            });
        });

        it('should emit room id and array of users to all room sockets on user join', done => {
            const {id: roomId} = roomService.createRoom();
            chatUser1 = connectUser(chatUser1, roomId, "admin");
            client1 = io.connect(socketURL, options);
            client1.once('connect', () => {
                client1.once('roomUsers', users => {
                    expect(users.room).toBe(roomId);
                    expect(users.users[0].id).toBeTruthy();
                    expect(users.users.length > 0).toBeTruthy();
                    client1.disconnect();
                    zeroOutData();
                    done();
                });

                client1.emit('joinRoom', chatUser1);
            });
        }, 5000);

        it('should emit setupAdmin with user object if user is admin', done => {
            const {id: roomId} = roomService.createRoom();
            chatUser1 = connectUser(chatUser1, roomId, "admin");
            client1 = io.connect(socketURL, options);
            client1.once('connect', () => {
                client1.once('setupAdmin', user => {
                    expect(user.id).toBeTruthy();
                    expect(user.username).toBe(chatUser1.username);
                    expect(user.room).toBe(roomId);
                    expect(user.email).toBe(chatUser1.email);
                    expect(user.messageCount).toBe(0);
                    expect(user.status).toBe("ONLINE");
                    expect(user.type).toBe("admin");
                    client1.disconnect();
                    zeroOutData();
                    done();
                });

                client1.emit('joinRoom', chatUser1);
            });
        });

        it('should emit message history when a new user joins', done => {
            const {id: roomId} = roomService.createRoom();
            chatUser1 = connectUser(chatUser1, roomId, "admin");
            chatUser2 = connectUser(chatUser2, roomId, "user");

            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('message', message => {
                    // welcome message
                    client1.emit('chatMessage', {text: 'test message'});
                });

                client1.emit('joinRoom', chatUser1);

                client2 = io.connect(socketURL, options);
                client2.on('connect', data => {
                    chatUser2.room = roomId;
                    client2.once('message', message => {
                        // welcome message
                        client2.once('message', message => {
                            // message history
                            expect(message.text).toBe('test message');
                            client1.disconnect();
                            client2.disconnect();
                            zeroOutData();
                            done();
                        });
                    });
                    client2.emit('joinRoom', chatUser2);
                });
            });
        });

    });

    describe("joinRoom Reconnect", () => {

        it('should reconnect user', done => {
            const {id: roomId} = roomService.createRoom();
            chatUser1 = connectUser(chatUser1, roomId, "admin");
            chatUser2 = connectUser(chatUser2, roomId, "user");
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('message', message => {
                    // welcome message
                    client1.once('message', message => {
                       // user 2 joined
                       client1.once('message', message => {
                           // user 2 left
                           client2 = io.connect(socketURL, options);
                           client2.on('connect', data => {
                               client2.once('reconnect', message => {
                                   // message history
                                   expect(message.message).toBe('Welcome Back');
                                   client1.disconnect();
                                   client2.disconnect();
                                   zeroOutData();
                                   done();
                               });
                           });
                           client2.emit('joinRoom', chatUser2);
                       });
                    });
                });

                client1.emit('joinRoom', chatUser1);

                client2 = io.connect(socketURL, options);
                client2.on('connect', data => {
                    client2.once('message', message => {
                        // welcome message
                        client2.disconnect();
                    });
                    client2.emit('joinRoom', chatUser2);
                });

            });
        }, 10000);

        it('should emit setupAdmin if reconnecting user is admin', done => {
            const {id: roomId} = roomService.createRoom();
            chatUser1 = connectUser(chatUser1, roomId, "admin");
            chatUser2 = connectUser(chatUser2, roomId, "user");
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('message', message => {
                    // welcome message
                    client1.once('message', message => {
                        // user 2 joined
                        client1.disconnect();
                    });
                });

                client1.emit('joinRoom', chatUser1);

                client2 = io.connect(socketURL, options);
                client2.on('connect', data => {
                    client2.once('message', message => {
                        // welcome message
                        client2.once('message', message => {
                            // user 1 left
                            client2.once('roomUsers', roomUsers => {
                                // user 2 left
                                client1 = io.connect(socketURL, options);
                                client1.on('connect', data => {
                                    client1.once('setupAdmin', user => {
                                        // message history
                                        expect(user.type).toBe('admin');
                                        client1.disconnect();
                                        client2.disconnect();
                                        zeroOutData();
                                        done();
                                    });
                                });
                                client1.emit('joinRoom', chatUser1);
                            });
                        });
                    });
                    client2.emit('joinRoom', chatUser2);
                });

            });
        });

    });

    describe("chatMessage", () => {

        it('should emit message back to sender on message event', done => {
            const {id: roomId} = roomService.createRoom();
            chatUser1 = connectUser(chatUser1, roomId, "admin");
            chatUser2 = connectUser(chatUser2, roomId, "user");
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('message', message => {
                    client1.once('message', message => {
                        expect(message.text).toBe("Hello, World!");
                        client1.disconnect();
                        zeroOutData();
                        done();
                    });

                    client1.emit('chatMessage', {text: "Hello, World!"});
                });

                client1.emit('joinRoom', chatUser1);
            });
        });

        it('should broadcast message to other users on message event', done => {
            const {id: roomId} = roomService.createRoom();
            chatUser1 = connectUser(chatUser1, roomId, "admin");
            chatUser2 = connectUser(chatUser2, roomId, "user");
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {

                client1.emit('joinRoom', chatUser1);

                client2 = io.connect(socketURL, options);
                client2.on('connect', data => {
                    logger.info("chatUser2 room:", chatUser2.room);
                    client2.once('message', message => {
                        client2.once('message', message => {
                            expect(message.text).toBe("Hello, World!");
                            client1.disconnect();
                            client2.disconnect();
                            zeroOutData();
                            done();
                        });
                        client1.emit('chatMessage', {text: "Hello, World!"});
                    });
                    client2.emit('joinRoom', chatUser2);
                });
            });
        });
        it('should emit updateMessageCount and increment sender message count by 1', done => {
            const {id: roomId} = roomService.createRoom();
            chatUser1 = connectUser(chatUser1, roomId, "admin");
            chatUser2 = connectUser(chatUser2, roomId, "user");
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('message', message => {
                    client1.once('updatedMessageCount', messageCount => {
                        expect(messageCount.count).toBe(1);
                        client1.disconnect();
                        zeroOutData();
                        done();
                    });

                    client1.emit('chatMessage', {text:"Hello, World!"});
                });

                client1.emit('joinRoom', chatUser1);
            });
        });
    });

    describe("emailInvite", () => {

        it('should emit inviteNotAllowed if user is not admin', done => {
            const {id: roomId} = roomService.createRoom();
            chatUser1 = connectUser(chatUser1, roomId, "admin");
            chatUser2 = connectUser(chatUser2, roomId, "user");
            let invite = {
                recipients: [{id: "id", email: "test@test.com"}]
            }
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {

                client1.emit('joinRoom', chatUser1);

                client2 = io.connect(socketURL, options);
                client2.on('connect', data => {
                    client2.once('inviteNotAllowed', userType => {
                        expect(userType !== 'admin').toBeTruthy();
                        client1.disconnect();
                        client2.disconnect();
                        zeroOutData();
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
            const {id: roomId} = roomService.createRoom();
            chatUser1 = connectUser(chatUser1, roomId, "admin");
            chatUser2 = connectUser(chatUser2, roomId, "user");
            // Bad email address
            let invite = {
                recipients: [{id: "id", email: "test-error"}]
            }
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('inviteSendFailure', inviteInput => {
                    expect(inviteInput.id).toBe("id");
                    client1.disconnect();
                    zeroOutData();
                    done();
                });
                client1.once('message', message => {
                   client1.emit('emailInvite', invite);
                });

                client1.emit('joinRoom', chatUser1);
            });
        }, 10000);

        it('should emit inviteSendSuccess email was successfully sent', done => {
            const {id: roomId} = roomService.createRoom();
            chatUser1 = connectUser(chatUser1, roomId, "admin");
            chatUser2 = connectUser(chatUser2, roomId, "user");
            let invite = {
                recipients: [{id: "id", email: process.env.TEST_EMAIL}]
            }
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('inviteSendSuccess', inviteInput => {
                    expect(inviteInput.id).toBe("id");
                    expect(inviteInput.email).toBe(process.env.TEST_EMAIL);
                    client1.disconnect();
                    zeroOutData();
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

        it('should notify remaining chat participants that a user left', () => {
            const {id: roomId} = roomService.createRoom();
            chatUser1 = connectUser(chatUser1, roomId, "admin");
            chatUser2 = connectUser(chatUser2, roomId, "user");
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('message', message => {
                    // welcome message
                    client1.once('message', message => {
                        client1.once('message', message => {
                            expect(message.text).toBe(`${chatUser2.username} has left the chat`);
                            client1.disconnect();
                            zeroOutData();
                        });
                    });
                });

                client1.emit('joinRoom', chatUser1);

                client2 = io.connect(socketURL, options);
                client2.on('connect', data => {
                    client2.once('message', message => {
                        client2.disconnect();
                    });
                    client2.emit('joinRoom', chatUser2);
                });
            });
        });
        it('should send updated users and room info when a user leaves', () => {

            const {id: roomId} = roomService.createRoom();
            chatUser1 = connectUser(chatUser1, roomId, "admin");
            chatUser2 = connectUser(chatUser2, roomId, "user");
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('roomUsers', roomUsers => {
                    expect(roomUsers.users.length).toBe(1);
                    client1.once('roomUsers', roomUsers => {
                        expect(roomUsers.users[1].status).toBe("ONLINE");
                        client1.once('roomUsers', roomUsers => {
                            expect(roomUsers.room).toBe(roomId);
                            expect(roomUsers.users.length).toBe(2);
                            expect(roomUsers.users[1].status).toBe("DISCONNECTED");
                            client1.disconnect();
                            zeroOutData();
                        });
                    });
                });

                client1.emit('joinRoom', chatUser1);

                client2 = io.connect(socketURL, options);
                client2.on('connect', data => {
                    client2.once('message', message => {
                        // welcome message
                        client2.disconnect();
                    });
                    client2.emit('joinRoom', chatUser2);
                });
            });
        });



        it('should stop disconnect timer if only remaining user reconnects before timeout', done => {

            const stopTimerSpy = jest.spyOn(LogoutTimer.prototype, 'stop');
            const {id: roomId} = roomService.createRoom();
            chatUser1 = connectUser(chatUser1, roomId, "admin");

            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                chatUser1.room = roomId;
                client1.on('roomUsers', roomUsers => {

                    client1.disconnect();
                });

                client1.emit('joinRoom', chatUser1);

                setTimeout(() => {

                    client1 = io.connect(socketURL, options);
                    client1.on('connect', () => {
                        client1.once('roomUsers', roomUsers => {

                            expect(stopTimerSpy).toHaveBeenCalled();

                            client1.disconnect();
                            zeroOutData();
                            done();
                        });
                        client1.emit('joinRoom', chatUser1);
                    });
                }, 2000);
            });
        });

        it('should destroy room after user disconnect times out', () => {
            const disconnectTimeoutSpy = jest.spyOn(globals, "getDisconnectTimeout").mockImplementation(() => 50);
            const destroyRoomSpy = jest.spyOn(roomService, "destroyRoom");
            const messageHistorySpy = jest.spyOn(messageRepository, "deleteMessagesByRoom");
            const deleteRoomUsersSpy = jest.spyOn(userRepository, "deleteAllUsersFromRoom");
            const deleteRoomSpy = jest.spyOn(roomRepository, "deleteRoom");

            const {id: roomId} = roomService.createRoom();
            chatUser1 = connectUser(chatUser1, roomId, "admin");
            chatUser2 = connectUser(chatUser2, roomId, "user");
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('roomUsers', roomUsers => {

                    client1.disconnect();
                    setTimeout(() => {
                        expect(destroyRoomSpy).toHaveBeenCalled();
                        expect(deleteRoomSpy).toHaveBeenCalled();
                        expect(deleteRoomUsersSpy).toHaveBeenCalled();
                        expect(messageHistorySpy).toHaveBeenCalled();
                        disconnectTimeoutSpy.mockRestore();
                        zeroOutData();
                    }, 2000);
                });

                client1.emit('joinRoom', chatUser1);
            });
        });
    });



    describe('uncaughtException test', () => {

        function myFunc(condition){
            if(condition){
                process.emit('uncaughtException', new Error);
            }
        }

        it('should catch an unhandled exception', done => {
            const disconnectTimeoutSpy = jest.spyOn(globals, "getDisconnectTimeout").mockImplementation(() => 50);
            const {id: roomId} = roomService.createRoom();
            chatUser1 = connectUser(chatUser1, roomId, "admin");
            chatUser2 = connectUser(chatUser2, roomId, "user");
            const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('message', message => {
                    myFunc(true);
                    expect(mockExit).toHaveBeenCalledWith(1);
                    client1.disconnect();
                    disconnectTimeoutSpy.mockRestore();
                    zeroOutData();
                    done();
                });

                client1.emit('joinRoom', chatUser1);
            });
        });
    });

    describe('blockUser', () => {

        it('should set status of ejected user to BLOCKED', done => {
            const {id: roomId} = roomService.createRoom();
            chatUser1 = connectUser(chatUser1, roomId, "admin");
            chatUser2 = connectUser(chatUser2, roomId, "user");
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('message', message => {
                    // welcome message
                    client1.once('message', message => {
                        // client 2 has joined message
                        client1.once('roomUsers', roomUsers => {
                            const client2socket = roomUsers.users[1].id;

                            // emit kickOutUser
                            client1.emit('blockUser', client2socket);
                        });
                    });
                });

                client2 = io.connect(socketURL, options);
                client2.on('connect', data => {
                    client2.once('message', message => {
                        // welcome message
                        client2.on('logoutUser', message => {
                            expect(message.message).toBe("userBlocked");
                            client1.disconnect();
                            client2.disconnect();
                            zeroOutData();
                            done();
                        });
                    });
                    client2.emit('joinRoom', chatUser2);
                });
            });

            client1.emit('joinRoom', chatUser1);
        });

        it('should set user status to BLOCKED if user is already disconnected', done => {
            const {id: roomId} = roomService.createRoom();
            chatUser1 = connectUser(chatUser1, roomId, "admin");
            chatUser2 = connectUser(chatUser2, roomId, "user");
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
                                    zeroOutData();
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
            const {id: roomId} = roomService.createRoom();
            chatUser1 = connectUser(chatUser1, roomId, "admin");
            chatUser2 = connectUser(chatUser2, roomId, "user");
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
                    client2.once('logoutUser', message => {
                        console.log("logoutUser received", message);
                        expect(message.message).toBe("userBlocked");
                        client1.disconnect();
                        client2.disconnect();
                        zeroOutData();
                        done();
                    });

                    client2.emit('joinRoom', chatUser2);
                });
            });

            client1.emit('joinRoom', chatUser1);
        }, 100000);

    });


});

