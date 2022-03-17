## Requirements
* [MongoDB v3](https://www.mongodb.com/)
* [Node 6.2](https://nodejs.org/en/)
* [Goole Developers account](https://console.developers.google.com)
* [Gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)

## Installation

1) Make sure all the requirements are installed before continuing. Create a folder on your server with write permissions, then go into that folder

```
sudo mkdir users
cd users
```
2) Download the users project from gitgub

If you want the latest stable release
```
sudo curl -o- https://raw.githubusercontent.com/Webinate/users/master/install-script.sh | bash
```
If you want the latest dev release
```
sudo curl -o- https://raw.githubusercontent.com/Webinate/users/dev/install-script-dev.sh | bash
```

3) Call 'npm install' to load the dependencies for building the project from source code

	npm install

4) Now build the project with gulp

    npm run build

Now edit the config.json with your server's setup details.