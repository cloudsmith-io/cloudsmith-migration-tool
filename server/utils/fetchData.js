const httpService = require("./httpService");
const loggerService = require("./loggerService");
const nexusService = require("./nexusService");
const jfrogService = require("./jfrogService");
const axios = require("axios");
const utils = require("./util.js");
const logger = require("../logger");

async function getRepoSpecificData(req, headers, data) {
    try {
        let url, reqHeaders;
        switch (req.query.repotype) {
            case "nexus":
                url = nexusService.getNexusUrl();
                reqHeaders = nexusService.getNexusHeaders();
                break;
            case "jfrog":
            default:
                url = jfrogService.getJfrogUrl(req.headers);
                reqHeaders = jfrogService.getJfrogHeaders(req.headers);
                break;
        }

        const repoListData = await httpService.getRequest(url, reqHeaders);
        const res = await getJfrogData(repoListData, req.headers["x-jfrogdomain"], reqHeaders);
        return res;
    }
    catch(err) {
        loggerService.logError(err);
    }
}

const cache = {};

async function getJfrogData(repoListData, jfrog_domain, headers) {
    const promises = repoListData.data.map(async (item) => {
        // Generate a unique cache key for this request
        const cacheKey = `${jfrog_domain}-${item.key}`;

        // If the data is in the cache, return it
        if (cache[cacheKey]) {
            return cache[cacheKey];
        }

        // Otherwise, make the request
        let url;
        if (item.type === "VIRTUAL") {
            url = `https://${jfrog_domain}/artifactory/api/repositories/${item.key}`;
        } else if (item.type === "LOCAL" || item.type === "REMOTE") {
            url = `https://${jfrog_domain}/artifactory/api/storage/${item.key}?list&deep=1`;
        }

        const res = await axios.get(url, {headers: headers});

        // Store the data in the cache
        cache[cacheKey] = res;

        return res;
    });

    const results = await Promise.all(promises);

    const res = results.map((result, index) => {
        const item = repoListData.data[index];
        if (item.type === "VIRTUAL") {
            const details = result.data;
            logger.info(
                `Virtual repo imported with data ${JSON.stringify(
                    details,
                    utils.replacerFunc()
                )}`
            );
            const virtualRepositories = details ? details.repositories : [];
            return {...item, repositories: virtualRepositories};
        } else if (item.type === "LOCAL" || item.type === "REMOTE") {
            const packageData = result.data;
            logger.info(
                `${item.type} repo received as ${JSON.stringify(
                    packageData,
                    utils.replacerFunc()
                )}`
            );
            if (packageData) {
                const files = packageData.files;
                const folders = files.filter((file) => file.folder).length;
                const totalSize = files
                    .filter((file) => !file.folder) // Exclude folders from the calculation
                    .reduce(
                        (acc, file) => acc + (file.size ? parseInt(file.size) : 0),
                        0
                    );
                const formattedTotalSize = utils.formatFileSize(totalSize);

                return {
                    ...item,
                    packagesInfo: {
                        totalRepositorySize: formattedTotalSize,
                        totalRepositorySizeBytes: totalSize,
                        totalRepositoryFiles: files.length,
                        totalRepositoryFolders: folders,
                        repositoryPackages: files.map((file) => ({
                            uri: file.uri,
                            size: utils.formatFileSize(file.size ? parseInt(file.size) : 0),
                            lastModified: file.lastModified,
                            folder: file.folder,
                            sha1: file.sha1,
                        })),
                    },
                };
            }
        }
        return item;
    });
    return res;
}


module.exports = {
    getRepoSpecificData,
    getJfrogData
}