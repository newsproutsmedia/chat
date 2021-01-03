const io = require('socket.io-client');
const uuid = require('uuid');
const Room = require('../../../services/room');
const User = require('../../../services/user');
const MessageHistory = require('../../../services/messageHistory');
const Invitations = require('../../../services/invitations');
const logger = require('../../../loaders/logger');

const PORT = process.env.PORT || 3000;
const socketURL = `http://localhost:${PORT}`;
const appName = process.env.PORT || "ChatApp";
const roomList = require('../../../services/roomList');

let options = {
        transports: ['websocket'],
        'force new connection': true
    };

let chatUser1;
let chatUser2;
let chatUser3;

let client1;
let client2;

const uniqueRoomId = '76b27bed-cfe5-4a2f-9615-90533a8942d8';
// mock entire uuid module, but only allow overwriting of v4 function
jest.mock("uuid", () => ({
    ...jest.requireActual("uuid"),
    v4: jest.fn()
}));

describe("Socket.IO Server-Side Events", () => {



    describe("joinRoom", () => {
        let server;
        let roomFullSpy;

        beforeEach(done => {
            chatUser1 = {username: 'Tom', email: 'tom@tom.com'};
            chatUser2 = {username: 'Sally', email: 'sally@sally.com'};
            roomFullSpy = jest.spyOn(Room.prototype, '_roomIsFull').mockImplementation(() => false);
            server = require('../../../server').server;
            done();
        });

        afterEach(done => {
            roomFullSpy.mockRestore();
            setTimeout(() => done(), 2000);
        })

        function validateRoom(room) {
            return uuid.validate(room);
        }

        it('should emit welcome message to new user when they join a room', done => {
            let roomId = 'f930702a-687c-4d0b-bdad-ccbb04eebdbd';
            uuid.v4.mockReturnValue(roomId);
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

        it('should broadcast to existing users when a new user joins room', done => {
            let roomId = '8d940814-0612-4ec6-9118-ed725c7ee704';
            uuid.v4.mockReturnValue(roomId);
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
                        done();
                    });
                    client2.emit('joinRoom', chatUser2);
                });
            });

        });

        it('should emit roomCreated with a valid room id when first user joins a room', done => {
            let roomId = 'd0b55b12-a0e3-4269-83ba-9054f9de6317';
            uuid.v4.mockReturnValue(roomId);
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
            let roomId = '30a5aa0c-4cc1-46f5-8193-ab9f1d5d1094';
            uuid.v4.mockReturnValue(roomId);
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
            let roomId = '57b4b02d-8f4d-4cb9-a461-c2a60b683503';
            uuid.v4.mockReturnValue(roomId);
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
            let roomId = '75494903-b3a4-4618-9480-8c1a20c3b38c';
            uuid.v4.mockReturnValue(roomId);
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
            let roomId = '14b2fbb7-7adc-414f-8ac2-c7cf3ac8331d';
            uuid.v4.mockReturnValue(roomId);
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
                            done();
                        });
                    });
                    client2.emit('joinRoom', chatUser2);
                });
            });
        });

    });

    describe("joinRoom Reconnect", () => {
        let server;
        let roomFullSpy;

        beforeEach(done => {
            chatUser1 = {username: 'Tom', email: 'tom@tom.com'};
            chatUser2 = {username: 'Sally', email: 'sally@sally.com'};
            chatUser3 = {username: 'Sally', email: 'sally@sally.com', room: uniqueRoomId};
            uuid.v4.mockReturnValue(uniqueRoomId);
            roomFullSpy = jest.spyOn(Room.prototype, '_roomIsFull').mockImplementation(() => false);
            server = require('../../../server').server;
            done();
        });

        afterEach(done => {
            roomFullSpy.mockRestore();
            setTimeout(() => done(), 1000);
        });

        it('should reconnect user', done => {
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
                                   done();
                               });
                           });
                           client2.emit('joinRoom', chatUser3);
                       });
                    });
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
        }, 10000);

        it('should emit setupAdmin if reconnecting user is admin', done => {
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
                    chatUser2.room = uniqueRoomId;
                    client2.once('message', message => {
                        // welcome message
                        client2.once('message', message => {
                            // user 1 left
                            client2.once('roomUsers', roomUsers => {
                                // user 2 left
                                client1 = io.connect(socketURL, options);
                                chatUser1.room = uniqueRoomId;
                                client1.on('connect', data => {
                                    client1.once('setupAdmin', user => {
                                        // message history
                                        expect(user.type).toBe('admin');
                                        client1.disconnect();
                                        client2.disconnect();
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

    describe("roomFull", () => {
        let server;

        beforeEach(done => {
            chatUser1 = {username: 'Tom', email: 'tom@tom.com'};
            chatUser2 = {username: 'Sally', email: 'sally@sally.com'};
            server = require('../../../server').server;
            done();
        });

        afterEach(done => {
            setTimeout(() => done(), 1000);
        })

        it('should emit access denied, roomFull if room is full', done => {
            let roomId = '127458eb-fd2e-4ce0-abda-c86e9baa30bd';
            uuid.v4.mockReturnValue(roomId);
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('roomUsers', roomUsers => {

                    client2 = io.connect(socketURL, options);
                    client2.on('connect', data => {
                        chatUser2.room = roomId;
                        client2.once('accessDenied', message => {
                            expect(message.message).toBe('roomFull');
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

    describe("chatMessage", () => {
        let server;
        let roomFullSpy;

        beforeEach(done => {
            chatUser1 = {username: 'Tom', email: 'tom@tom.com'};
            chatUser2 = {username: 'Sally', email: 'sally@sally.com'};
            roomFullSpy = jest.spyOn(Room.prototype, '_roomIsFull').mockImplementation(() => false);
            server = require('../../../server').server;
            done();
        });

        afterEach(done => {
            roomFullSpy.mockRestore();
            setTimeout(() => done(), 1000);
        })

        it('should emit message back to sender on message event', done => {
            let roomId = '15d97ada-702d-4923-91c8-dab1e762ae01';
            uuid.v4.mockReturnValue(roomId);
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
            let roomId = '062d6bde-649b-46c4-9802-3c042ff3cdc1';
            uuid.v4.mockReturnValue(roomId);
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {

                client1.emit('joinRoom', chatUser1);

                client2 = io.connect(socketURL, options);
                client2.on('connect', data => {
                    chatUser2.room = roomId;
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
            let roomId = '4f068e97-4f44-4e67-9c7a-2b38c40708f1';
            uuid.v4.mockReturnValue(roomId);
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
        let roomFullSpy;

        beforeEach(done => {
            chatUser1 = {username: 'Tom', email: 'tom@tom.com'};
            chatUser2 = {username: 'Sally', email: 'sally@sally.com'};
            roomFullSpy = jest.spyOn(Room.prototype, '_roomIsFull').mockImplementation(() => false);
            server = require('../../../server').server;
            done();
        });

        afterEach(done => {
            roomFullSpy.mockRestore();
            setTimeout(() => done(), 1000);
        })

        it('should emit inviteNotAllowed if user is not admin', done => {
            let roomId = '3caf2dde-31de-4a20-850c-2818e3dd2c17';
            uuid.v4.mockReturnValue(roomId);
            let invite = {
                recipients: [{id: "id", email: "test@test.com"}]
            }
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {

                client1.emit('joinRoom', chatUser1);

                client2 = io.connect(socketURL, options);
                client2.on('connect', data => {
                    chatUser2.room = roomId;
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
            let roomId = '1370870f-c4d3-4e8a-b3ee-75f9d6599dce';
            uuid.v4.mockReturnValue(roomId);
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
            let roomId = 'b68307c1-3f38-4d4b-9c63-6c7f5e0141c4';
            uuid.v4.mockReturnValue(roomId);
            let invite = {
                recipients: [{id: "id", email: process.env.TEST_EMAIL}]
            }
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('inviteSendSuccess', inviteInput => {
                    expect(inviteInput.id).toBe("id");
                    expect(inviteInput.email).toBe(process.env.TEST_EMAIL);
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
        let roomFullSpy;
        let inviteCountSpy;

        beforeEach(done => {
            chatUser1 = {username: 'Tom', email: 'tom@tom.com'};
            chatUser2 = {username: 'Sally', email: 'sally@sally.com'};
            roomFullSpy = jest.spyOn(Room.prototype, '_roomIsFull').mockImplementation(() => false);
            inviteCountSpy = jest.spyOn(Invitations, 'getInvitationCount').mockReturnValue(1).mockReturnValue(2);
            server = require('../../../server').server;
            done();
        });

        afterEach(done => {
            roomFullSpy.mockRestore();
            inviteCountSpy.mockRestore();
            setTimeout(() => done(), 2000);
        });

        it('should notify remaining chat participants that a user left', done => {
            let roomId = 'bfae795a-3815-42f4-b7a0-73ca8de8b060';
            uuid.v4.mockReturnValue(roomId);
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
                    chatUser2.room = roomId;
                    client2.once('message', message => {
                        client2.disconnect();
                    });
                    client2.emit('joinRoom', chatUser2);
                });
            });
        });
        it('should send updated users and room info when a user leaves', done => {
            let roomId = '4494d412-9d1a-4195-a9a7-aaaf5cad0263';
            uuid.v4.mockReturnValue(roomId);
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
                            done();
                        });
                    });
                });

                client1.emit('joinRoom', chatUser1);

                client2 = io.connect(socketURL, options);
                client2.on('connect', data => {
                    chatUser2.room = roomId;
                    client2.once('message', message => {
                        // welcome message
                        client2.disconnect();
                    });
                    client2.emit('joinRoom', chatUser2);
                });
            });
        });


    });

    describe('reconnect', () => {

        let server;
        let roomFullSpy;
        let inviteCountSpy;

        beforeEach(done => {
            chatUser1 = {username: 'Tom', email: 'tom@tom.com'};
            chatUser2 = {username: 'Sally', email: 'sally@sally.com'};
            roomFullSpy = jest.spyOn(Room.prototype, '_roomIsFull').mockImplementation(() => false);
            inviteCountSpy = jest.spyOn(Invitations, 'getInvitationCount').mockReturnValue(1).mockReturnValue(2);
            server = require('../../../server').server;
            done();
        });

        afterEach(done => {
            roomFullSpy.mockRestore();
            inviteCountSpy.mockRestore();
            setTimeout(() => done(), 2000);
        });

        it('should destroy room after user disconnect times out', done => {
            jest.useFakeTimers("legacy");
            const destroyRoomSpy = jest.spyOn(User, "destroyRoom");
            const messageHistorySpy = jest.spyOn(MessageHistory, "deleteRoomMessages");
            const deleteRoomUsersSpy = jest.spyOn(User, "deleteRoomUsers");
            const roomListSpy = jest.spyOn(roomList, "deleteRoom");
            const deleteRoomFromInvitationListSpy = jest.spyOn(Invitations, "deleteRoomFromInvitationList");

            let roomId = '8017f699-b0cd-40a1-8d23-19ffb1a8af9b';
            uuid.v4.mockReturnValue(roomId);
            client1 = io.connect(socketURL, options);
            client1.on('connect', () => {
                client1.once('roomUsers', roomUsers => {

                    client1.disconnect();
                    jest.runAllTimers();
                    jest.useRealTimers();
                    expect(destroyRoomSpy).toHaveBeenCalled();
                    expect(roomListSpy).toHaveBeenCalled();
                    expect(deleteRoomFromInvitationListSpy).toHaveBeenCalled();
                    expect(deleteRoomUsersSpy).toHaveBeenCalled();
                    expect(messageHistorySpy).toHaveBeenCalled();

                    done();
                });

                client1.emit('joinRoom', chatUser1);
            });
        });
    });

    describe('uncaughtException test', () => {
        let server;
        let roomFullSpy;

        beforeEach(done => {
            chatUser1 = {username: 'Tom', email: 'tom@tom.com'};
            chatUser2 = {username: 'Sally', email: 'sally@sally.com'};
            roomFullSpy = jest.spyOn(Room.prototype, '_roomIsFull').mockImplementation(() => false);
            server = require('../../../server').server;
            done();
        });

        afterEach(done => {
            roomFullSpy.mockRestore();
            setTimeout(() => done(), 1000);
        });

        function myFunc(condition){
            if(condition){
                process.emit('uncaughtException', new Error);
            }
        }

        it('should catch an unhandled exception', done => {
            let roomId = '348b457f-cfe3-46c4-aaed-a50500297e5e';
            uuid.v4.mockReturnValue(roomId);
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
        let roomFullSpy;
        let inviteCountSpy;
        beforeEach(done => {
            chatUser1 = {username: 'Tom', email: 'tom@tom.com'};
            chatUser2 = {username: 'Sally', email: 'sally@sally.com'};
            roomFullSpy = jest.spyOn(Room.prototype, '_roomIsFull').mockImplementation(() => false);
            inviteCountSpy = jest.spyOn(Invitations, 'getInvitationCount').mockReturnValue(1).mockReturnValue(2);
            server = require('../../../server').server;
            done();
        });

        afterEach(done => {
            roomFullSpy.mockRestore();
            inviteCountSpy.mockRestore();
            setTimeout(() => done(), 2000);
        });

        it('should set status of ejected user to BLOCKED', done => {
            let roomId = '25408263-6145-4a19-b6f5-e70af74ff274';
            uuid.v4.mockReturnValue(roomId);
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
                    chatUser2.room = roomId;
                    client2.once('message', message => {
                        // welcome message
                        client2.on('logoutUser', message => {
                            expect(message.message).toBe("userBlocked");
                            client1.disconnect();
                            client2.disconnect();
                            done();
                        });
                    });
                    client2.emit('joinRoom', chatUser2);
                });
            });

            client1.emit('joinRoom', chatUser1);
        });

        it('should set user status to BLOCKED if user is already disconnected', done => {
            let roomId = '8a126832-a6e1-4cf3-a049-0d931073e022';
            uuid.v4.mockReturnValue(roomId);
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
                    chatUser2.room = roomId;
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
            let roomId = '27ee2853-def4-4590-8e36-8fe6c17fbecc';
            uuid.v4.mockReturnValue(roomId);
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
                    chatUser2.room = roomId;
                    client2.once('logoutUser', message => {
                        console.log("logoutUser received", message);
                        expect(message.message).toBe("userBlocked");
                        client1.disconnect();
                        client2.disconnect();
                        done();
                    });

                    client2.emit('joinRoom', chatUser2);
                });
            });

            client1.emit('joinRoom', chatUser1);
        }, 100000);

    });


});

