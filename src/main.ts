import * as cluster from 'cluster';
import * as os from 'os';
import * as yargs from 'yargs';

const args = yargs.argv;
let numCPUs = os.cpus().length;

// Check for the threads argument
if ( args.numThreads ) {
    if ( args.numThreads === 'max' ) {
        console.log( `Setting the number of clusters to  ${numCPUs}` );
    }
    else if ( isNaN( parseInt( args.numThreads ) ) ) {
        console.log( 'attribute numThreads must be a number' );
        process.exit();
    }
    else if ( args.numThreads > numCPUs ) {
        console.log( `You only have ${numCPUs} threads available - attribute numThreads will be set to ${numCPUs}` );
    }
    else if ( args.numThreads ) {
        console.log( `Setting the number of clusters to  ${args.numThreads}` );
        numCPUs = args.numThreads;
    }
}

// Run as a single cluster
if ( numCPUs === 1 ) {
    console.log( `Running as single cluster` );
    require( './startup.js' );
}
else if ( cluster.isMaster ) {
    // Fork workers.
    for ( let i = 0; i < numCPUs; i++ )
        cluster.fork();

    // List each of the process ID's
    Object.keys( cluster.workers ).forEach( function( id ) {
        console.log( 'Starting cluster with ID : ' + cluster.workers[ id ].process.pid );
    });

    // When a cluster dies - lets try start it up again
    cluster.on( 'exit', function( deadWorker ) {
        const worker = cluster.fork();

        // Note the process IDs
        const newPID = worker.process.pid;
        const oldPID = deadWorker.process.pid;

        console.log( `Cluster ${worker.process.pid} died` );
        console.log( `Attempting to restart failed cluster` );

        // Log the event
        console.log( `worker ${oldPID} died` );
        console.log( `worker ${newPID} born` );
    });
}
else {
    require( './startup.js' );
}