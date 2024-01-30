const logger = require("../logger");
const util=require("./util")
const axios = require("axios");
function getCloudSmithRepoPayload(repoName){
    if(!repoName)
        throw new Error("REPO NAME NOT PROVIDED")  //// CHECK THIS ONCE
    const repoCreatePayload = {
        content_kind: "Standard",
        copy_packages: "Read",
        default_privilege: "None",
        delete_packages: "Admin",
        move_packages: "Admin",
        replace_packages: "Write",
        repository_type_str: "Private",
        resync_packages: "Admin",
        scan_packages: "Read",
        storage_region: "default",
        view_statistics: "Read",
        name: repoName
    };
    // more operations in future here
    return repoCreatePayload
}

function getCloudSmithHeaders(apiKey){
    const headers={
        accept: "application/json",
        "content-type": "application/json",
        "X-Api-Key": `${apiKey}`,
    };
    return headers
}

function getUpstreamPayload(url,name){
    if(!url||!name)
        throw new Error("upstream config is incorrect")
    const payload = {
        auth_mode: "None",
        mode: "Proxy Only",
        upstream_url: url,
        name: name,
    };
    return payload
}

function getCloudsmithUserDetails(apiKey) {
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            "X-Api-Key": `${apiKey}`,
        },
    };

    return fetch("https://api.cloudsmith.io/v1/user/self/", options)
        .then((response) => response.json())
        .then((response) => response)
        .catch((err) => {
            console.error(err);
            logger.error(
                `error in fetching user details ${JSON.stringify(err, util.replacerFunc())}`
            );
        });
}

function getCloudsmithRepositories(apiKey, owner) {
    const page_size = 50;
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            "X-Api-Key": `${apiKey}`,
        },
    };

    return fetch(
        `https://api.cloudsmith.io/v1/repos/${owner}/?page_size=${page_size}`,
        options
    )
        .then((response) => response.json())
        .then((response) => {
            if (Array.isArray(response)) {
                return response.map(repo => ({ name: repo.name, self_html_url: repo.self_html_url }));
            } else {
                return [{ "error": "404"}];
            }
        })
        .catch((err) => {
            console.error(err);
            logger.error(
                `error in fetching  cloudsmith repositories ${JSON.stringify(
                    err,
                    util.replacerFunc()
                )}`
            );
        });
}

async function insertCloudsmithData(reqBodyArr,owner,apiKey) {
    for (let i = 0; i < reqBodyArr.length; i++) {
        try {
            let repo = reqBodyArr[i];
            const url = `https://api.cloudsmith.io/v1/repos/${owner}/`;
            const payload_1 = getCloudSmithRepoPayload(repo["cloudsmith-repository"]);
            const headers_1 = getCloudSmithHeaders(apiKey)
            const response_1 = await axios.post(url, payload_1, {
                headers: headers_1,
            });
            for (let j = 0; j < repo["upstreams"].length; j++) {
                try {
                    let upstreamRepo = repo["upstreams"][j];
                    const payload = getUpstreamPayload(upstreamRepo["url"], upstreamRepo["name"])

                    const headers = headers_1

                    const repoType = util.getRepoType(
                        upstreamRepo["upstream_format"].toUpperCase()
                    );

                    const urlUpstream = `https://api.cloudsmith.io/v1/repos/${owner}/${repo["cloudsmith-repository"]}/upstream/${repoType}/`;

                    const response = await axios.post(
                        urlUpstream,
                        payload,
                        {headers: headers}
                    );
                } catch (error) {
                    if (error?.response?.data)
                        logger.error(
                            `got error in upstream skipping this for now ${JSON.stringify(
                                error.response.data,
                                util.replacerFunc()
                            )}`
                        );
                    else {
                        logger.error(
                            `got error in upstream skipping this for now ${JSON.stringify(
                                error,
                                util.replacerFunc()
                            )}`
                        );
                    }
                }
            }
        } catch (error) {
            if (error?.response?.data)
                logger.error(
                    `particular repo upload failed ${JSON.stringify(
                        error.response.data,
                        util.replacerFunc()
                    )}`
                );
            else {
                logger.error(
                    `particular repo upload failed ${JSON.stringify(
                        error,
                        util.replacerFunc()
                    )}`
                );
            }
        }
    }
}

module.exports={
    getCloudsmithRepositories,
    getCloudsmithUserDetails,
    insertCloudsmithData
}