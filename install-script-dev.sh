#!/bin/bash -e
{ # this ensures the entire script is downloaded #

# Stops the execution of a script if a command or pipeline has an error
set -e

echo "Downloading dev version from github"

#download latest
wget https://github.com/MKHenson/modepress/archive/dev.zip
unzip -o "dev.zip" "modepress-dev/*"

# Moves the server folder to the current directory
cp -r modepress-dev/* .

# Remove modepress folder
if [ -d "modepress-dev" ]; then
	rm modepress-dev -R
fi

# Remove the zip file
rm "dev.zip"


# All done
echo "Modepress successfully downloaded"
exit
} # this ensures the entire script is downloaded #