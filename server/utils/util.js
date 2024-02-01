const logger = require("../logger");
const constants = require("../constants/constant.js");

// Function to prevent circular references in JSON.stringify
const replacerFunc = () => {
    const visited = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (visited.has(value)) {
                return;
            }
            visited.add(value);
        }
        return value;
    };
};

// Function to format file sizes in a human-readable way
function formatFileSize(size) {
    if (size === 0) return "0 B";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// Function to validate the request body, API key, and owner
function validatebody(reqBody, apiKey, owner) {
    if (!Array.isArray(reqBody) || !apiKey || !owner) {
        logger.error("Error: The body is not an array or the API key or owner is missing");
        return false;
    }

    const urlRegex = new RegExp("^(https?)://[^s/$.?#].*$");
    for (const repo of reqBody) {
        if (repo.upstreams) {
            for (const upstreamRepo of repo.upstreams) {
                if (upstreamRepo.url && !urlRegex.test(upstreamRepo.url)) {
                    logger.error("Error: The URL is not valid");
                    return false;
                }
            }
        }
    }

    return true;
}

// Function to get the repository type
function getRepoType(repoType) {
    return constants.PACKAGE_FORMATS[repoType];
}

module.exports = {
    replacerFunc,
    formatFileSize,
    getRepoType,
    validatebody
};