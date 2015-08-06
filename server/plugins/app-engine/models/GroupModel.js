/**
* A class that is used to describe the project model
*/
var Group = (function () {
    /**
    * Creates an instance of a project
    */
    function Group(name, projectID, createdBy) {
        this.name = name;
        this.project_id = projectID;
        this.createdBy = createdBy;
        this.json = {
            assets: []
        };
        this.created_on = Date.now();
        this.last_modified = Date.now();
    }
    return Group;
})();
exports.Group = Group;
