var fs = require('fs');
var yargs = require("yargs");
var args = yargs.argv;

if (!args.config || !fs.existsSync(args.config)) {
	console.log("Please specify a modepress --config file to use in the command line");
	process.exit();
}

if (!args.uconfig || !fs.existsSync(args.uconfig)) {
	console.log("Please specify a users --uconfig file to use in the command line");
	process.exit();
}

if (args.server === undefined || isNaN(parseInt(args.server)) ) {
	console.log("Please specify a --server index in the cmd arguments to test. This index refers to the array item in the modepress config.servers array");
	process.exit();
}

require('./tests/header.js');
require('./tests/users.js');
require('./tests/posts.js');
require('./tests/comments.js');