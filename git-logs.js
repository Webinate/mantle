var util = require( 'util' )
var fs = require( 'fs' )
var exec = require( 'child_process' ).exec;
var child;

var prevTag = "v0.4.3";
var nextTag = "v0.5.0";


// Executes the git log command
child = exec( 'git log ' + prevTag + '...' + nextTag + ' --pretty=format:"{ \\"author\\" : \\"%an\\", \\"commit\\" : \\"%h\\", \\"date\\" : \\"%ar\\", \\"title\\" : \\"%s\\" },"', function( error, stdout, stderr ) {

  var jsonStr = "{ \"data\" : [ " + stdout.toString();
  jsonStr = jsonStr.substr( 0, jsonStr.length - 1 ) + " ] } ";

  try {
    var json = JSON.parse( jsonStr );
    json = json.data;

    console.log( "Parsed JSON" )

    var changes = "";
    for ( var i = 0, l = json.length; i < l; i++ )
      changes += `* ${json[ i ].title} - see ${json[ i ].commit} \n`;

    try {
      fs.writeFile( 'changes.md', changes, function( err ) {
        if ( err )
          throw err;
        console.log( 'It\'s saved!' );
      } );
    }
    catch ( err ) {
      console.log( 'Could not write file:  ' + err );
    }
  }
  catch ( err ) {
    console.log( 'Could not parse JSON:  ' + err );
    console.log( 'JSON STRING: ' + jsonStr );
  }


  if ( error !== null ) {
    console.log( 'exec error: ' + error );
  }
} );