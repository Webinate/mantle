/**
* A class that is used to describe the project model
*/
var Script = (function () {
    /**
    * Creates an instance of a project
    */
    function Script(shallowId, container, behaviour, projectID, createdBy) {
        this.shallowId = shallowId;
        this.container_id = container;
        this.behaviour_id = behaviour;
        this.project_id = projectID;
        this.createdBy = createdBy;
        this.onEnter = "";
        this.onInitialize = "";
        this.onDispose = "";
        this.onFrame = "";
        this.created_on = Date.now();
        this.last_modified = Date.now();
    }
    return Script;
})();
exports.Script = Script;
