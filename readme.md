# modepress
A simple Mongo-Node CMS server. The server content can be accessed via an admin
panel and content can be requested via its RESTful API.
Modepress is written in Typescript using (at the least) mongodb v3 and nodejs 0.0.12.
Both mongo and node must be setup and running before you can run modepress.
Modepress also requires an instance of webinate-users to be running.

## Current stable version
* v0.3.2

## Requirements
* MongoDB v3
* Node 6.2
* [Webinate-Users](https://github.com/MKHenson/webinate-users)
* **Tested Ubuntu v14**
* [Gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)

## Installation

1) Make sure the requirements are installed and running
2) Create a folder where you want to store the modepress project

```
mkdir modepress
cd modepress
```

3) Run as an admin / or make sure you have write privileges in the modepress folder
```
sudo su
```

4) Download and install the desired version from github
If you want the latest stable version:

```
curl -o- https://raw.githubusercontent.com/MKHenson/modepress/master/install-script.sh | bash
```

OR if you want the dev build

```
curl -o- https://raw.githubusercontent.com/MKHenson/modepress/dev/install-script-dev.sh | bash
```

This downloads the latest modepress project into the current folder. There are two sub-folders, one named server and one named admin.
The server folder holds the modepress server code and the admin holds a front-end app to administrate the server.

5) Install the server dependencies, and build the server source code

```
cd server
npm install
gulp install
gulp build-all
```

After you call the build-all task, a dist folder is created within the server folder. This represents your distribution folder.
You still need to install the dependencies for this folder, so go into it and do an npm install

 ```
cd dist
npm install
```


6) The dist folder comes with an example config json file. These config files are used to start and configure your modepress instance.
Its best to leave the example file as is and make a copy for yourself to edit.

```
cp example-config.json config.json
```

Now edit the config.json to suite your needs.

7) To run the modepress server

```
node main.js --config="config.json" --logFile="logs.log" --logging="true" --numThreads="max"
```

By default modepress will run using all threads available to your application. If however memory is in short supply you
can set the number of threads in the command line

```
node main.js --config="config.json" --numThreads="max"
node main.js --config="config.json" --numThreads="4"
```

8) Install the client and its dependencies.

```
cd ../../admin
npm install
gulp install
gulp build-all
```

Like with the server this creates a dist folder within the admin directory. Tbc...