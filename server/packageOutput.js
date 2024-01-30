const repos = [
  {
    "key" : "libs-snapshots-local",
    "packageType" : "Maven",
  },
  {
    "key" : "libs-releases-local-2",
    "packageType" : "Maven",
  },
  {
    "key" : "generic-local",
    "packageType" : "Generic",
  },
  {
    "key" : "remote-repo",
    "packageType" : "Maven",
  },
  {
    "key" : "nuget-local",
    "packageType" : "NuGet",
  },
  {
    "key" : "docker-remote",
    "packageType" : "Docker",
  },
  {
    "key" : "yum-local",
    "packageType" : "YUM",
  },
  {
    "key" : "debian-local",
    "packageType" : "Debian",
  },
  {
    "key" : "debian-local-new",
    "packageType" : "Debian",
  },
];

const extensions = {
  "libs-snapshots-local": ".jar",
  "libs-releases-local-2": ".jar",
  "generic-local": ".zip",
  "remote-repo": ".jar",
  "nuget-local": ".nupkg",
  "docker-remote": ".tar.gz",
  "yum-local": ".rpm",
  "debian-local": ".deb",
  "debian-local-new": ".deb",
};

const folders = [
  "production",
  "staging",
  "development",
  "testing",
  "qa",
  "uat",
  "preprod",
];

const subfolders = [
  "archive",
  "backup",
  "old",
  "new",
  "current",
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate() {
  const start = new Date("2023-12-16T12:30:00Z");
  const end = new Date("2023-12-16T12:40:00Z");
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}
function generateRandomFileName(extension) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const fileNameLength = 8; // Adjust the length of the random string as needed
  let randomFileName = '';

  for (let i = 0; i < fileNameLength; i++) {
    const randomIndex = getRandomInt(0, characters.length - 1);
    randomFileName += characters.charAt(randomIndex);
  }

  return `${randomFileName}${extension}`;
}
function getRandomSize() {
  return `${getRandomInt(1000, 500000)}`;
}
function generateObjects(repos, extensions, folders, subfolders) {
  const objectsArray = [];

  repos.forEach(repo => {
    const repoObjects = {
      uri: `http://localhost:8081/artifactory/api/storage/${repo.key}/org/acme`,
      created: '2023-12-16T12:34:56Z',
      files: []
    };

    const numFolders = getRandomInt(3, 5); // Randomize the number of folders

    for (let i = 0; i < numFolders; i++) {
      const folderName = folders[getRandomInt(0, folders.length - 1)];
      const subfolderName = subfolders[getRandomInt(0, subfolders.length - 1)];
      const folderPath = `/${folderName}/${subfolderName}`;
      
      // Check if the folder exists in repoObjects
      const existingFolder = repoObjects.files.find(file => file.uri === folderPath && file.folder === 'true');

      if (!existingFolder) {
        // Generate a folder entry if it doesn't exist
        const folder = {
          uri: folderPath,
          folder: 'true',
          lastModified: getRandomDate(),
          mdTimestamps: { properties: getRandomDate() }
        };
        
        repoObjects.files.push(folder);
      }

      // Generate random file name using generateRandomFileName function
      const fileName = generateRandomFileName(extensions[repo.key]);

      // Generate a file for each folder
      const file = {
        uri: `${folderPath}/${fileName}`,
        size: getRandomSize(),
        lastModified: getRandomDate(),
        folder: 'false',
        sha1: 'sha1Checksum',
        mdTimestamps: { properties: getRandomDate() }
      };

      repoObjects.files.push(file);
    }

    objectsArray.push(repoObjects);
  });

  return objectsArray;
}

module.exports = generateObjects(repos, extensions, folders, subfolders);