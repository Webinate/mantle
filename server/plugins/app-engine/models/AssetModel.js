/**
* A class that is used to describe the project model
*/
var Asset = (function () {
    /**
    * Creates an instance of a project
    */
    function Asset(shallowId, name, className, projectID, createdBy, json) {
        if (json === void 0) { json = []; }
        this.name = name;
        this.shallowId = shallowId;
        this.className = className;
        this.project_id = projectID;
        this.createdBy = createdBy;
        this.json = json;
        this.created_on = Date.now();
        this.last_modified = Date.now();
    }
    return Asset;
})();
exports.Asset = Asset;
