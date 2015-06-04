#!/bin/bash -e
{ # this ensures the entire script is downloaded #

# Stops the execution of a script if a command or pipeline has an error
set -e

# Functiom that prints the latest stable version
nvm_latest_version() {
  echo "v0.0.1"
}

echo "cleaning up folder..."

# Remove node modules
if [ -d "node_modules" ]; then
	rm node_modules -R
fi

# Remove views
if [ -d "views" ]; then
	rm views -R
fi

# Remove resources
if [ -d "resources" ]; then
	rm resources -R
fi

# Remove lib
if [ -d "lib" ]; then
	rm lib -R
fi

echo "Downloading latest version from github $(nvm_latest_version)"

#download latest
wget https://github.com/MKHenson/modepress/archive/master.zip
unzip -o "master.zip" "modepress-master/*"

# Moves the server folder to the current directory
mv modepress-master/server/* .

# Remove modepress-master
if [ -d "modepress-master" ]; then
	rm modepress-master -R
fi

# Remove the zip file
rm master.zip

if [ !-d "config.json" ]; then
	# Copy the example config to a config.json
	cp "example-config.json" "config.json"
fi


# All done
echo "Modepress successfully installed"
echo "Please run an NPM update and edit the config.json"
exit
} # this ensures the entire script is downloaded #