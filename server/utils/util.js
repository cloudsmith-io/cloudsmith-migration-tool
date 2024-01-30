const logger = require("../logger");
const constants=require("../constants/constant.js")
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
// Adjust the formatFileSize function to handle 0 bytes appropriately
function formatFileSize(size) {
    if (size === 0) {
        return "0 B";
    } else if (size < 1024) {
        return size + " B";
    } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(2) + " KB";
    } else if (size < 1024 * 1024 * 1024) {
        return (size / (1024 * 1024)).toFixed(2) + " MB";
    } else {
        return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    }
}

function validatebody(reqBody, apiKey, owner) {
    if (!Array.isArray(reqBody) || !apiKey || !owner) {
        logger.error(
            "error in data either the body is not array or api or owner is absent"
        );
        return false;
    }
    for (let i = 0; i < reqBody.length; i++) {
        let repo = reqBody[i];
        if (repo["upstreams"]) {
            for (let j = 0; j < repo["upstreams"].length; j++) {
                let upstreamRepo = repo["upstreams"][j];
                const regex = new RegExp("^(https?)://[^s/$.?#].*$");
                if (upstreamRepo["url"] && !regex.test(upstreamRepo["url"])) {
                    logger.error("url is not a valid regex");
                    return false;
                }
            }
        }
    }
    return true;
}
function getRepoType(repoType) {
    return constants.PACKAGE_FORMATS[repoType];
}
module.exports={
    replacerFunc,
    formatFileSize,
    getRepoType,
    validatebody
}