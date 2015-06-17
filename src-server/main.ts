import * as cluster from "cluster";
import * as os from "os";

var numCPUs = os.cpus().length;

if (cluster.isMaster)
{
    // Fork workers.
    for (var i = 0; i < numCPUs; i++)
        cluster.fork();

    // List each of the process ID's
    Object.keys(cluster.workers).forEach(function (id)
    {
        console.log("Starting cluster with ID : " + cluster.workers[id].process.pid);
    });

    // When a cluster dies - lets try start it up again
    cluster.on('exit', function (deadWorker, code, signal)
    {
        var worker = cluster.fork();

        // Note the process IDs
        var newPID = worker.process.pid;
        var oldPID = deadWorker.process.pid;

        console.log(`Cluster ${worker.process.pid} died`);
        console.log(`Attempting to restart failed cluster`);

        // Log the event
        console.log(`worker ${oldPID} died`);
        console.log(`worker ${newPID} born`);
    });
}
else
{
    require("./Startup.js");
}