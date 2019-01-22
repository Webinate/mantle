#!/bin/bash -e
{ # this ensures the entire script is downloaded #

# Stops the execution of a script if a command or pipeline has an error
set -e

echo "Downloading dev version from github"

#download latest
wget https://github.com/Webinate/mantle/archive/dev.zip
unzip -o "dev.zip" "mantle-dev/*"

# Moves the server folder to the current directory
cp -r mantle-dev/* .

# Remove mantle folder
if [ -d "mantle-dev" ]; then
	rm mantle-dev -R
fi

# Remove the zip file
rm "dev.zip"


# All done
echo "Mantle successfully downloaded"
exit
} # this ensures the entire script is downloaded #