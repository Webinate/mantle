#!/bin/bash -e
{ # this ensures the entire script is downloaded #

# Stops the execution of a script if a command or pipeline has an error
set -e

# Functiom that prints the latest stable version
version() {
  echo "0.0.20"
}

echo "Downloading latest version from github $(version)"

#download latest
wget https://github.com/MKHenson/modepress/archive/v$(version).zip
unzip -o "v$(version).zip" "modepress-$(version)/*"

# Moves the server folder to the current directory
cp -r modepress-$(version)/server/* .

# Remove modepress folder
if [ -d "modepress-$(version)" ]; then
	rm modepress-$(version) -R
fi

# Remove the zip file
rm "v$(version).zip"

# Copy the example config into config.json as long as it doesnt already exist
if [ ! -f "config.json" ]; then
	# Copy the example config to a config.json
	cp "example-config.json" "config.json"
fi


# All done
echo "Modepress successfully installed"
echo "Please run an NPM update and edit the config.json"
exit
} # this ensures the entire script is downloaded #