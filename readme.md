# Mantle

Mantle provides a series of endpoints and api calls for developing a project based CMS

## Requirements

- MongoDB v3
- Node 17.0.0

## Installation

1. Make sure the requirements are installed and running
2. Create a folder where you want to store the mantle project

```
mkdir mantle
cd mantle
```

3. Make sure you have write priviledges in the folder

4. Download and install the desired version from github. If you want the latest stable version:

```
curl -o- https://raw.githubusercontent.com/Webinate/mantle/master/install-script.sh | bash
```

This downloads the latest mantle project into the current folder.

5. Install the dependencies, and build the source code

```
npm install
npm build
```

6. In the root folder comes an example config json file (./config.json). This config file is used to start your mantle instance. Edit the config.json to suite your needs.

7. To run the mantle server

```
npm run start-server
```

By default mantle will run using all threads available to your application. If however memory is in short supply you can set the number of threads in the command line

```
node main.js --config="config.json" --numThreads="max"
node main.js --config="config.json" --numThreads="4"
```

To see if the service is running, you can check the status by hitting the url HOST/api/status
