# Mantle
A simple Mongo-Node CMS. Mantle provides a series of endpoints and api calls
that make developing node based single page apps a breeze. The system handles
a set of core functions for any web based app and then using a plugin architecture
users can create additional end points and functions to enhance the sytem.

## Current stable version
* v0.10.3

## Requirements
* MongoDB v3
* Node 8.2.1

## Installation
1) Make sure the requirements are installed and running
2) Create a folder where you want to store the mantle project

```
mkdir mantle
cd mantle
```

3) Run as an admin / or make sure you have write privileges in the mantle folder
```
sudo su
```

4) Download and install the desired version from github
If you want the latest stable version:

```
curl -o- https://raw.githubusercontent.com/Webinate/modepress/master/install-script.sh | bash
```

OR if you want the dev build

```
curl -o- https://raw.githubusercontent.com/Webinate/modepress/dev/install-script-dev.sh | bash
```

This downloads the latest mantle project into the current folder.

5) Install the dependencies, and build the source code

```
npm install
gulp build
```

After you call the build task, a dist folder is created. This represents your distribution folder.

6) In the root folder comes an example config json file. These config files are used to start and configure your mantle instance.
Its best to leave the example file as is and make a copy for yourself to edit.

```
cp example-config.json config.json
```

Now edit the config.json to suite your needs.

7) To run the mantle server

```
node main.js --config="config.json" --logFile="logs.log" --logging="true" --numThreads="max"
```

By default mantle will run using all threads available to your application. If however memory is in short supply you can set the number of threads in the command line

```
node main.js --config="config.json" --numThreads="max"
node main.js --config="config.json" --numThreads="4"
```

Without configuring mantle, you're not likely to see much. The best way to get started would be
to download some example projects into your clients directory. This directory attempts to discover
all client projects for mantle. Its done by checking all immediate sub folders for a modepress.json.
The json file describes to modepress how it should load the client and what to do with its contents.