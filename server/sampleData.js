module.exports = [
    {
        "key": "libs-releases-local",
        "type": "LOCAL",
        "description": "Local repository for in-house libraries",
        "url": "http://localhost:8081/artifactory/libs-releases-local",
        "packageType": "Generic"
    },
    {
        "key": "libs-snapshots-local",
        "type": "LOCAL",
        "description": "Local repository for in-house snapshots",
        "url": "http://localhost:8081/artifactory/libs-snapshots-local",
        "packageType": "Maven"
    },
    {
        "key": "libs-releases-local-2",
        "type": "LOCAL",
        "description": "Local repository for in-house releases",
        "url": "http://localhost:8081/artifactory/libs-snapshots-local",
        "packageType": "Maven"
    },
    {
        "key": "generic-local",
        "type": "LOCAL",
        "description": "Local generic repository",
        "url": "http://localhost:8081/artifactory/generic-local",
        "packageType": "Generic"
    },
    {
        "key": "remote-repo",
        "type": "REMOTE",
        "description": "Remote repository for external libraries",
        "url": "http://external-server/artifactory/remote-repo",
        "packageType": "Maven"
    },
    {
        "key": "virtual-repo",
        "type": "VIRTUAL",
        "description": "Virtual repository combining multiple repositories",
        "url": "http://localhost:8081/artifactory/virtual-repo",
        "packageType": "Generic"
    },
    {
        "key": "nuget-local",
        "type": "LOCAL",
        "description": "Local NuGet repository",
        "url": "http://localhost:8081/artifactory/nuget-local",
        "packageType": "NuGet"
    },
    {
        "key": "docker-remote",
        "type": "REMOTE",
        "description": "Remote Docker repository",
        "url": "http://docker-registry/artifactory/docker-remote",
        "packageType": "Docker"
    },
    {
        "key": "yum-local",
        "type": "LOCAL",
        "description": "Local YUM repository",
        "url": "http://localhost:8081/artifactory/yum-local",
        "packageType": "YUM"
    },
    {
        "key": "debian-local",
        "type": "LOCAL",
        "description": "Local Debian repository",
        "url": "http://localhost:8081/artifactory/debian-local",
        "packageType": "Debian"
    },
    {
        "key": "debian-local-new",
        "type": "LOCAL",
        "description": "Local Debian repository",
        "url": "http://localhost:8081/artifactory/debian-local",
        "packageType": "Debian"
    },
];
