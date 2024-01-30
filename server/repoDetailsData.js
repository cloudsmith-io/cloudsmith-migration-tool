module.exports = [
    {
        "key": "remote-repo",
        "projectKey": "projx",
        "environments": ["DEV", "PROD"],
        "rclass": "remote",
        "packageType": "Maven",
        "url": "http://external-server/artifactory/remote-repo",
        "username": "remote-repo-user",
        "password": "pass",
        "proxy": "proxy1",
        "disableProxy": false,
        "description": "Remote repository for external libraries",
        "notes": "Some internal notes",
        "includesPattern": "**/*",
        "excludesPattern": "",
        "repoLayoutRef": "maven-2-default",
        "remoteRepoLayoutRef": "",
        "remoteRepoChecksumPolicyType": "generate-if-absent",
        "handleReleases": true,
        "handleSnapshots": true,
        "maxUniqueSnapshots": 0,
        "suppressPomConsistencyChecks": false,
        "hardFail": false,
        "offline": false,
        "blackedOut": false,
        "storeArtifactsLocally": true,
        "socketTimeoutMillis": 15000,
        "localAddress": "212.150.139.167",
        "retrievalCachePeriodSecs": 43200,
        "missedRetrievalCachePeriodSecs": 7200,
        "unusedArtifactsCleanupPeriodHours": 0,
        "assumedOfflinePeriodSecs": 300,
        "fetchJarsEagerly": false,
        "fetchSourcesEagerly": false,
        "shareConfiguration": false,
        "synchronizeProperties": false,
        "blockMismatchingMimeTypes": true,
        "xrayIndex": false,
        "propertySets": ["ps1", "ps2"],
        "allowAnyHostAuth": false,
        "enableCookieManagement": false,
        "enableTokenAuthentication": false,
        "bowerRegistryUrl": "https://registry.bower.io",
        "gitRegistryUrl": "https://github.com/rust-lang/crates.io-index",
        "composerRegistryUrl": "https://packagist.org",
        "pyPIRegistryUrl": "https://pypi.org",
        "vcsType": "GIT",
        "vcsGitProvider": "GITHUB",
        "vcsGitDownloadUrl": "",
        "bypassHeadRequests": false,
        "clientTlsCertificate": "",
        "externalDependenciesEnabled": false,
        "externalDependenciesPatterns": ["**/*microsoft*/**", "**/*github*/**"],
        "downloadRedirect": "false",
        "cdnRedirect": "false",
        "feedContextPath": "api/v2",
        "downloadContextPath": "api/v2/package",
        "v3FeedUrl": "https://api.nuget.org/v3/index.json",
        "contentSynchronisation": {
          "enabled": false,
          "statistics": {
            "enabled": false
          },
          "properties": {
            "enabled": false
          },
          "source": {
            "originAbsenceDetection": false
          }
        },
        "blockPushingSchema1": false,
        "priorityResolution": false,
        "disableUrlNormalization": false
      },
      {
        "key": "virtual-repo",
        "projectKey": "projx",
        "environments": ["DEV", "PROD"],
        "rclass": "virtual",
        "packageType": "Generic",
        "repositories": ["libs-releases-local", "libs-snapshots-local", "generic-local", "remote-repo", "virtual-repo"],
        "description": "Virtual repository combining multiple repositories",
        "notes": "Some internal notes",
        "includesPattern": "**/*",
        "excludesPattern": "",
        "repoLayoutRef": "maven-2-default",
        "debianTrivialLayout": false,
        "artifactoryRequestsCanRetrieveRemoteArtifacts": false,
        "keyPair": "keypair1",
        "pomRepositoryReferencesCleanupPolicy": "discard_active_reference",
        "defaultDeploymentRepo": "libs-releases-local",
        "optionalIndexCompressionFormats": ["bz2", "lzma", "xz"],
        "forceMavenAuthentication": false,
        "externalDependenciesEnabled": false,
        "externalDependenciesPatterns": ["**/*microsoft*/**", "**/*github*/**"],
        "externalDependenciesRemoteRepo": "",
        "primaryKeyPairRef": "mygpgkey",
        "secondaryKeyPairRef": "mysecgpgkey"
      }
];