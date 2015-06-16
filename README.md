# modepress
A simple Mongo-Node CMS server. The server content can be accessed via an admin 
panel and content can be requested via its RESTful API.
Modepress is written in Typescript using (at the least) mongodb v3 and nodejs 0.0.12. 
Both mongo and node must be setup and running before you can run modepress.
Modepress also requires an instance of webinate-users to be running.

## Current stable version
* v0.0.15

## Requirements
* MongoDB v3
* Node 0.0.12
* Webinate-Users
* **Tested Ubuntu v14**

## Installation

1) Make sure the requirements are installed and running
2) Create a folder where you want to store modepress

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
curl -o- https://raw.githubusercontent.com/MKHenson/modepress/dev/install-script.sh | bash
```

OR if you want the dev build

```
curl -o- https://raw.githubusercontent.com/MKHenson/modepress/dev/install-script-dev.sh | bash
```

5) Run NPM update

```
npm update
```

6) Edit the config.json with your setup
7) Run modepress

```
node main.js config.json prod
```
