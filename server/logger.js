const winston = require("winston");
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const normalLogTransport = new transports.File({
  filename: "logs/app.log",
  level: "info",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    logFormat
  ),
});

const errorLogTransport = new transports.File({
  filename: "logs/error.log",
  level: "error",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    logFormat
  ),
});

const logger = createLogger({
  transports: [normalLogTransport, errorLogTransport],
});
logger.stream = {
  write: function (message) {
    logger.info(message.trim());
  },
};

module.exports = logger;
