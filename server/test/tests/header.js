var test = require('unit.js');
var fs = require('fs');
var yargs = require("yargs");
var args = yargs.argv;

// Load the files
var config = fs.readFileSync(args.config);
var uconfig = fs.readFileSync(args.uconfig);
try
{
    // Parse the config files
    console.log("Parsing files...");
    config = JSON.parse(config);
	uconfig = JSON.parse(uconfig);
    config = config.servers[ parseInt(args.server) ];
}
catch (exp)
{
	console.log(exp.toString())
	process.exit();
}

var usersAgent = test.httpAgent("http://"+ uconfig.host +":" + uconfig.portHTTP);
var modepressAgent = test.httpAgent("http://"+ config.host +":" + config.portHTTP);
var adminCookie = "";


function TestManager() {
    this.usersAgent= usersAgent,
    this.modepressAgent = modepressAgent,
    this.adminCookie = adminCookie,
    this.config = config,
    this.uconfig = uconfig
};

// Create the test manager to declare the shared variables
var testManager = new TestManager();

// Export the manager
exports.singleton = function() {
  return testManager;
}