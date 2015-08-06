/**
* A class that is used to describe the project model
*/
var File = (function () {
    /**
    * Creates an instance of a project
    */
    function File(user) {
        this.name = "";
        this.user = user;
        this.size = 0;
        this.favourite = false;
        this.tags = [];
        this.url = "";
        this.path = "";
        this.previewUrl = "";
        this.previewPath = "";
        this.global = false;
        this.createdOn = Date.now();
        this.lastModified = Date.now();
    }
    return File;
})();
exports.File = File;
