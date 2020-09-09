#!/bin/bash -e
{ # this ensures the entire script is downloaded #

# Stops the execution of a script if a command or pipeline has an error
set -e

# Functiom that prints the latest stable version
version() {
  echo "0.4.1"
}

echo "Downloading latest version from github $(version)"

#download latest
wget https://github.com/Webinate/mantle/archive/v$(version).zip
unzip -o "v$(version).zip" "mantle-$(version)/*"

# Moves the server folder to the current directory
cp -r mantle-$(version)/* .

# Remove mantle folder
if [ -d "mantle-$(version)" ]; then
	rm mantle-$(version) -R
fi

# Remove the zip file
rm "v$(version).zip"

# All done
echo "Mantle v$(version) successfully downloaded"
exit
} # this ensures the entire script is downloaded #