/**
* A class that is used to describe the project model
*/
var Plugin = (function () {
    /**
    * Creates an instance of a project
    */
    function Plugin() {
        this.name = "";
        this.folderName = "";
        this.description = "";
        this.shortDescription = "";
        this.plan = "basic";
        this.path = "";
        this.header = "";
        this.body = "";
        this.deployables = [];
        this.css = "";
        this.image = "";
        this.author = "Webinate Ltd";
        this.version = "0.0.1";
    }
    return Plugin;
})();
exports.Plugin = Plugin;
