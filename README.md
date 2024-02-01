## Cloudsmith Repository Migration Tool

Extract, Transform, Load (ETL) tool to facilitate the extraction of the repository structure from JFrog Artifactory and migrating it to Cloudsmith. The tool will support the transformation and mapping of the repository structure on Cloudsmith, including the creation of required repositories and upstream sources.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Running the project](#running-the-project)
- [How to Guide](#how-to-guide)
- [Contributing](#contributing)

  
## Getting Started

These instructions will help you set up and run the project on your local machine.

### Prerequisites

Make sure you have the following installed:

Install node.js and npm by downloading the latest version based on your current operating system.
* [NodeJS](https://nodejs.org/en/download)
```
node -v
```
* [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
```
npm -v
```

Create an account on [npmjs.com](https://www.npmjs.com/login) and login to npm from terminal/shell.
```
npm login
```

### Installation

Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/cloudsmith-io/cloudsmith-migration-tool.git
cd cloudsmith-migration-tool
```

## Running the project

Open two terminals/shells:

In first shell:
```
cd cloudsmith-migration-tool/client
npm install --legacy-peer-deps 
npm start
```

In second shell:
```
cd cloudsmith-migration-tool/server
npm install --legacy-peer-deps
node server.js
```

Open [http://localhost:3000](http://localhost:3000) to run the mapping tool in your browser.

## How to Guide

### User Authentication screen

* Cloudsmith Org Name - Name of the Cloudsmith organisation (https://cloudsmith.io/<org-name>/repos/)
* Cloudsmith API Key - API Key generated from Cloudsmith org -> Users -> API Settings.
* JFrog Org Name - The name of the JFrog Artifactory cloud instance can be checked from MyJFrog(JPD Name)
* JFrog API Key - <Bearer AccessToken> Access Token can be generated from JFrog Artifactory cloud from the User Management screen.

### Auto-merge to single-format repo 
* This option enables users to automatically merge similar format source repositories into a single repository at the destination.
* Users can choose a naming convention for the destination repositories or choose the default format <AutoCreated-format>

### Add selected repositories to the group
* This option enables users to manually merge source repositories into a user-defined multi-format repository or an already existing repository at Cloudsmith.
* Users can choose a naming convention for each of the destination repositories.

### Migrate Repositories
* This option allows users to migrate the repositories from the mapping JSON(generated after using any of the above two options) to the Cloudsmith instance.
* The JSON file is auto-downloaded that would be required as input for the Data migration tool.

### Download JSON
* Users can also manually download the JSON file before doing the migration.

### Update Credentials
* Users can switch to another JFrog or Cloudsmith workspace in case they want to migrate from multiple instances.
* After updating the JFrog credentials, new repository metadata will be fetched from the new instance.

### Errors & Logs
Look for these paths in the project folder to check logs : [server/logs/error.log](server/logs/error.log) & [server/logs/app.log](server/logs/app.log.).


## Contributing
If you would like to contribute to the project, follow these steps:

* Fork the repository
* Create a new branch: git checkout -b feature-branch
* Make your changes and commit: git commit -am 'Add new feature'
* Push to the branch: git push origin feature-branch
* Submit a pull request
