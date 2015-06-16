#!/bin/bash -e
{ # this ensures the entire script is downloaded #

# Stops the execution of a script if a command or pipeline has an error
set -e

echo "Downloading dev version from github"

#download latest
wget https://github.com/MKHenson/modepress/archive/dev.zip
unzip -o "modepress-dev.zip" "modepress-dev/*"

# Moves the server folder to the current directory
cp -r modepress-dev/server/* .

# Remove modepress-master
if [ -d "modepress-dev" ]; then
	rm modepress-dev -R
fi

# Remove the zip file
rm "modepress-dev.zip"

if [ ! -f "config.json" ]; then
	# Copy the example config to a config.json
	cp "example-config.json" "config.json"
fi


# All done
echo "Modepress successfully installed"
echo "Please run an NPM update and edit the config.json"
exit
} # this ensures the entire script is downloaded #