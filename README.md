## Cloudsmith Repository Migration Tool

Extract, Transform, Load (ETL) tool to facilitate the extraction of the repository structure from JFrog Artifactory and migrating it to Cloudsmith. The tool will support the transformation and mapping of the repository structure on Cloudsmith, including the creation of required repositories and upstream sources.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Running the project](#running-the-project)
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

## Contributing
If you would like to contribute to the project, follow these steps:

* Fork the repository
* Create a new branch: git checkout -b feature-branch
* Make your changes and commit: git commit -am 'Add new feature'
* Push to the branch: git push origin feature-branch
* Submit a pull request
