const os = require("os");
const winston = require('winston');

class Logger {
    constructor(name) {
        this.name = name;
        this.hostname = os.hostname();
        this.logger = winston.createLogger({
            level: 'info',
            defaultMeta: {service: name},
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.metadata({fillExcept: ['timestamp', 'service', 'level', 'message']}),
                        winston.format.colorize(),
                        this.winstonConsoleFormat()
                    )
                })
            ]
        });
    }

    winstonConsoleFormat() {
        return winston.format.printf(({ timestamp, level, message, metadata }) => {
            const metadataString = metadata != null ? JSON.stringify(metadata) : '';

            return `[${timestamp}][${level}][${this.name}@${this.hostname}] ${message} ${'metadata: ' + metadataString}`;
        })
    }

    // Uncomment to implement various log levels
/*    debug(log, metadata) {
        this.logger.debug(log, metadata);
    }*/

    info(log, metadata) {
        this.logger.info(log, metadata);
    }

    warn(log, metadata) {
        this.logger.warn(log, metadata);
    }

    error(log, metadata) {
        this.logger.error(log, metadata);
    }

/*    log(level, log, metadata) {
        const metadataObject = {}
        if (metadata) metadataObject.metadata = metadata

        this.logger[level](log, metadataObject)
    }*/
}

// Logger has a name
module.exports = new Logger(process.env.APP_NAME || "System");

// Uncomment to expose a function if we want
// to use the logger with custom parameters
/*
module.getLogger = (name) => {
    return new Logger(name);
}*/
