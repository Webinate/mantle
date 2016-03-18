First install/update the dependencies

	npm install

Make sure mocha is installed globally

	npm install -g mocha

Ensure that both the modepress and users servers are running

Then run the tests. Make sure you pass in as arguments, both the modepress "--config" and Users "--uconfig" file locations. You also need to specify which server to test with the --server argument. This is an index of the servers property in the modepress config json. If you have 3 servers, you can  test the first by specifying --server=0 and the last by specifying --server=2

	mocha tests.js -R spec --config="../server/example-config.json" --uconfig="../users/server/example-config.json" --server=0