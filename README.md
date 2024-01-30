## Cloudsmith repository migration tool

### How to run the tool?

#### Requirements:

* NodeJS
* NPM
[Setup Link](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

#### Running the project:

Open two terminals/shells:

In first shell:
```
cd cloudsmith_migration_tool/client
npm install --legacy-peer-deps 
npm start
```

In second shell:
```
cd cloudsmith_migration_tool/server
npm install --legacy-peer-deps
node server.js
```
