#!/bin/bash -e
{ # this ensures the entire script is downloaded #

# Stops the execution of a script if a command or pipeline has an error
set -e

# Functiom that prints the latest stable version
version() {
  echo "0.9.0"
}

echo "Downloading latest version from github $(version)"

#download latest
wget https://github.com/Webinate/modepress/archive/v$(version).zip
unzip -o "v$(version).zip" "modepress-$(version)/*"

# Moves the server folder to the current directory
cp -r modepress-$(version)/* .

# Remove modepress folder
if [ -d "modepress-$(version)" ]; then
	rm modepress-$(version) -R
fi

# Remove the zip file
rm "v$(version).zip"

# All done
echo "Modepress v$(version) successfully downloaded"
exit
} # this ensures the entire script is downloaded #