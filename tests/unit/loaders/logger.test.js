const os = require('os');
const {getAppName} = require('../../../loaders/globals');

jest.mock('winston', () => {
    const mFormat = {
        combine: jest.fn(),
        metadata: jest.fn(),
        timestamp: jest.fn(),
        colorize: jest.fn(),
        printf: jest.fn(),
    };
    const mTransports = {
        Console: jest.fn(),
        File: jest.fn(),
    };
    const mLogger = {
        info: jest.fn(),
    };
    return {
        format: mFormat,
        transports: mTransports,
        createLogger: jest.fn(() => mLogger),
    };
});
const { createLogger, format, transports } = require('winston');

describe("test logger", () => {

    afterEach(() => {
        jest.resetAllMocks();
    })

    it('should set metadataString to empty if metadata = null', done => {
        const initialAppName = getAppName();
        process.env.APP_NAME = "testApp";
        const templateFunctions = [];
        format.printf.mockImplementation((templateFn) => {
            templateFunctions.push(templateFn);
        });
        const logger = require('../../../loaders/logger');
        logger.info('Hello World');
        const info = {
            timestamp: 123,
            level: 'info',
            message: 'testing',
            metadata: null
        };
        const testLogger = templateFunctions.shift();
        expect(testLogger(info)).toBe(`[${info.timestamp}][${info.level}][${process.env.APP_NAME}@${os.hostname()}] ${info.message} metadata: `);
        info.metadata = "myMeta";
        expect(testLogger(info)).toBe(`[${info.timestamp}][${info.level}][${process.env.APP_NAME}@${os.hostname()}] ${info.message} metadata: ${JSON.stringify(info.metadata)}`);
        process.env.APP_NAME = initialAppName;
        done();
    });

});