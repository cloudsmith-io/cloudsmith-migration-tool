const logger = require("../logger");
const utils=require("./util.js")

function logError(err) {
    logger.error(`error in code internal error ${JSON.stringify(err, utils.replacerFunc())}`);
}

function logInfo(message, data) {
    logger.info(`${message} ${JSON.stringify(data, utils.replacerFunc())}`);
}

module.exports = {
    logError,
    logInfo
}