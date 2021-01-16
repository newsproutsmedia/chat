require('dotenv').config();
const Mail = require('../../../services/mail');
const userRepository = require('../../../repositories/user.repository');

const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

describe('getGoogleAccessToken', () => {

    it('should return an error when access token not received', async () => {

        // GIVEN
        const oAuth2Client = new OAuth2("clientId", "clientSecret", "redirectUri");
        const userSpy = jest.spyOn(userRepository, 'getCurrentUserById').mockImplementation(() => {
            return {
                username: "testUser",
                email: "test@user.email",
                room: "testRoom"
            };
        })
        // WHEN
        oAuth2Client.setCredentials({ refresh_token: "aRefreshToken"});
        // THEN
        const recipients = [{
            id: 1,
            email: "test@test.com"
        }];
        const socket = {id: 1};
        const io = {id: 1};
        const mail = new Mail({recipients, socket, io});
        expect.assertions(1);
        return expect(mail._getGoogleAccessToken(oAuth2Client)).rejects.toBeFalsy();
    });

    it('should return a token', async () => {
        // THEN
        const recipients = [{
            id: 1,
            email: "test@test.com"
        }];
        const socket = {id: 1};
        const io = {id: 1};

        const userSpy = jest.spyOn(userRepository, 'getCurrentUserById').mockImplementation(() => {
            return {
                username: "testUser",
                email: "test@user.email",
                room: "testRoom"
            };
        });

        // GIVEN
        const oauth2Client = new OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            "https://developers.google.com/oauthplayground"
        );

        oauth2Client.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN
        });

        const mail = new Mail({recipients, socket, io});
        expect.assertions(1);
        return expect(mail._getGoogleAccessToken(oauth2Client)).resolves.toBeTruthy();
    });

});