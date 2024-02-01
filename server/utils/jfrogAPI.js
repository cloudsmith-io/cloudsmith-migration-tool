const logger = require("../logger");
const utils = require("./util.js");
const axios = require("axios");

function getBaseUrl(domain) {
    return `https://${domain}.jfrog.io/artifactory/api`;
}

function getHeaders(apiKey) {
    return { Authorization: apiKey };
}

async function fetchRepoData(url, headers) {
    try {
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (err) {
        logger.error(`Error fetching data from ${url}: ${err}`);
        throw err;
    }
}

async function processRepo(repo, baseUrl, headers) {
    let url;
    if (repo.type === "VIRTUAL") {
        url = `${baseUrl}/repositories/${repo.key}`;
    } else if (repo.type === "LOCAL" || repo.type === "REMOTE") {
        url = `${baseUrl}/storage/${repo.key}?list&deep=1`;
    } else {
        return repo;
    }

    const data = await fetchRepoData(url, headers);
    logger.info(`${repo.type} repo received as ${JSON.stringify(data, utils.replacerFunc())}`);

    return data;
}

async function getJfrogRepoDetails(req) {
    const baseUrl = getBaseUrl(req.headers["x-jfrogdomain"]);
    const headers = getHeaders(req.headers["x-apikey"]);
    const url = `${baseUrl}/repositories`;

    try {
        const repoListData = await fetchRepoData(url, headers);
        return Promise.all(repoListData.data.map(repo => processRepo(repo, baseUrl, headers)));
    } catch (err) {
        logger.error(`Error in getJfrogRepoDetails: ${err}`);
    }
}

module.exports = {
    getJfrogRepoDetails,
};