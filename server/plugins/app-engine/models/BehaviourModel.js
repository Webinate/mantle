/**
* A class that is used to describe the project model
*/
var Behaviour = (function () {
    /**
    * Creates an instance of a project
    */
    function Behaviour(name, shallowId, projectID, createdBy) {
        this.name = name;
        this.shallowId = shallowId;
        this.project_id = projectID;
        this.createdBy = createdBy;
        this.json = {};
        this.created_on = Date.now();
        this.last_modified = Date.now();
    }
    return Behaviour;
})();
exports.Behaviour = Behaviour;
