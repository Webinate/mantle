#!/bin/bash -e
{ # this ensures the entire script is downloaded #

# Stops the execution of a script if a command or pipeline has an error
set -e

# Functiom that prints the latest stable version
version() {
  echo "0.0.8"
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

echo "Downloading latest version from github $(version)"

#download latest
wget https://github.com/MKHenson/modepress/archive/v$(version).zip
unzip -o "v$(version).zip" "modepress-$(version)/*"

# Moves the server folder to the current directory
mv modepress-$(version)/server/* .

# Remove modepress-master
if [ -d "modepress-master" ]; then
	rm modepress-master -R
fi

# Remove the zip file
rm "v$(version).zip"

if [ !-d "config.json" ]; then
	# Copy the example config to a config.json
	cp "example-config.json" "config.json"
fi


# All done
echo "Modepress successfully installed"
echo "Please run an NPM update and edit the config.json"
exit
} # this ensures the entire script is downloaded #