describe('test globals', () => {

    it('should default to "chatApp" if APP_NAME env var not set', done => {
        const initAppName = process.env.APP_NAME;
        delete process.env.APP_NAME;
        const {appName} = require('../../../loaders/globals');
        expect(appName).toBe("ChatApp");
        process.env.APP_NAME = initAppName;
        console.log(process.env.APP_NAME);
        done();
    });

});

