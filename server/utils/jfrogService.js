function getJfrogUrl(headers) {
    return `https://${headers["x-jfrogdomain"]}.jfrog.io/artifactory/api/repositories`;
}

function getJfrogHeaders(headers) {
    return {Authorization: `${headers["x-apikey"]}`};
}

module.exports = {
    getJfrogUrl,
    getJfrogHeaders
}