const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Function to create a transport with a given filename and level
function createTransport(filename, level) {
  return new transports.File({
    filename,
    level,
    format: combine(
      timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      logFormat
    ),
  });
}

const normalLogTransport = createTransport('logs/app.log', 'info');
const errorLogTransport = createTransport('logs/error.log', 'error');

const logger = createLogger({
  transports: [normalLogTransport, errorLogTransport],
});

logger.stream = {
  write: function (message) {
    logger.info(message.trim());
  },
};

module.exports = logger;