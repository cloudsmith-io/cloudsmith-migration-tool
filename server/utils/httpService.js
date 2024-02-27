const axios = require("axios");

async function getRequest(url, headers) {
    return await axios.get(url, {headers: headers});
}

module.exports = {
    getRequest
}