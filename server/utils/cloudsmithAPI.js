import axios from 'axios';
import logger from '../logger';
import util from './util';

// Base URL for all API calls
const BASE_URL = 'https://api.cloudsmith.io/v1/';

// Function to log errors and re-throw them
function logError(error, message) {
    const errorData = error?.response?.data || error;
    logger.error(`${message} ${JSON.stringify(errorData, util.replacerFunc())}`);
    throw error;
}


// Fetches the details of the current user from the Cloudsmith API.
async function getCloudsmithUserDetails(apiKey) {
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            "X-Api-Key": `${apiKey}`,
        },
    };

    try {
        const response = await fetch(`${BASE_URL}user/self/`, options);
        return await response.json();
    } catch (err) {
        logError(err, 'error in fetching user details');
    }
}

// Fetches the repositories of a given owner from the Cloudsmith API.
async function getCloudsmithRepositories(apiKey, owner) {
    const page_size = 50;
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            "X-Api-Key": `${apiKey}`,
        },
    };

    try {
        const response = await fetch(
            `${BASE_URL}repos/${owner}/?page_size=${page_size}`,
            options
        );
        const data = await response.json();
        return Array.isArray(data) ? data.map(repo => ({ name: repo.name, self_html_url: repo.self_html_url })) : [{ "error": "404"}];
    } catch (err) {
        logError(err, 'error in fetching cloudsmith repositories');
    }
}

// Inserts data into the Cloudsmith API.
async function insertCloudsmithData(reqBodyArr, owner, apiKey) {
    const promises = reqBodyArr.map(async (repo) => {
        try {
            const url = `${BASE_URL}repos/${owner}/`;
            const payload_1 = getCloudSmithRepoPayload(repo['cloudsmith-repository']);
            const headers_1 = getCloudSmithHeaders(apiKey);
            await axios.post(url, payload_1, { headers: headers_1 });

            const upstreamPromises = repo['upstreams'].map(async (upstreamRepo) => {
                try {
                    const payload = getUpstreamPayload(upstreamRepo['url'], upstreamRepo['name']);
                    const headers = headers_1;
                    const repoType = util.getRepoType(upstreamRepo['upstream_format'].toUpperCase());
                    const urlUpstream = `${BASE_URL}repos/${owner}/${repo['cloudsmith-repository']}/upstream/${repoType}/`;
                    await axios.post(urlUpstream, payload, { headers });
                } catch (error) {
                    logError(error, 'got error in upstream skipping this for now');
                }
            });

            await Promise.all(upstreamPromises);
        } catch (error) {
            logError(error, 'particular repo upload failed');
        }
    });

    await Promise.all(promises);
}

export { getCloudsmithRepositories, getCloudsmithUserDetails, insertCloudsmithData };