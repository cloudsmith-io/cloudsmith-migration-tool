const logger = require("../logger");
const utils=require("./util.js")
const axios = require("axios");
function getRepoUrl(req){
    switch (req.query.repotype){
        case "nexus":
            return "nexusUrl" //to be implemented
            break;
        case "jfrog":
            return `https://${req.headers["x-jfrogdomain"]}.jfrog.io/artifactory/api/repositories`;
            break;
        default:
            return `https://${req.headers["x-jfrogdomain"]}.jfrog.io/artifactory/api/repositories`; //todo remove this once we get value from fe
    }
}
function getHeaders(req){
    switch (req.query.repotype){
        case "nexus":
            return {header:"123"} //to be implemented
            break;
        case "jfrog":
            return {Authorization: `${req.headers["x-apikey"]}`};
            break;
        default:
            return {Authorization: `${req.headers["x-apikey"]}`}; //todo remove this once we get value from fe
    }
}
async function getRepoSpecificData(req, headers, data) {
    try {
        switch (req.query.repotype) {
            case "jfrog":
                return "hadnle"
            default:
                //todo remove this once we get value from fe
                const url = getRepoUrl(req)
                headers = getHeaders(req);
                const repoListData = await axios.get(url, {headers: headers});
                const res = getJfrogData(repoListData, req.headers["x-jfrogdomain"], headers)
                return res;
        }
    }
    catch(err) {
        logger.error(
            `error in code internal error ${JSON.stringify(err, util.replacerFunc())}`
        );
    }
}

async function getJfrogData(repoListData,jfrog_domain,headers) {
    const res = await Promise.all(
        repoListData.data.map(async (item) => {
            if (item.type === "VIRTUAL") {
                const url_1 = `https://${jfrog_domain}.jfrog.io/artifactory/api/repositories/${item.key}`;
                const res = await axios.get(url_1, {headers: headers});
                const details = res.data;
                logger.info(
                    `Virtual repo imported with data ${JSON.stringify(
                        details,
                        utils.replacerFunc()
                    )}`
                );
                const virtualRepositories = details ? details.repositories : [];
                return {...item, repositories: virtualRepositories};
            } else if (item.type === "LOCAL" || item.type === "REMOTE") {
                const url_1 = `https://${jfrog_domain}.jfrog.io/artifactory/api/storage/${item.key}?list&deep=1`;
                const res = await axios.get(url_1, {headers: headers});
                const packageData = res.data;
                logger.info(
                    `${item.type} repo recieved as ${JSON.stringify(
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
        })
    );
    return res
}
module.exports={
    getRepoSpecificData
}