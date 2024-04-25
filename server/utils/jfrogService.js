function getJfrogUrl(headers) {
    return `https://${headers["x-jfrogdomain"]}/artifactory/api/repositories`;
}

function getJfrogHeaders(headers) {
    return {Authorization: `Bearer ${headers["x-apikey"]}`};
}

module.exports = {
    getJfrogUrl,
    getJfrogHeaders
}