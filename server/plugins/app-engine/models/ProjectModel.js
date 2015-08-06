(function (PrivilegeType) {
    PrivilegeType[PrivilegeType["NONE"] = 0] = "NONE";
    PrivilegeType[PrivilegeType["READ"] = 1] = "READ";
    PrivilegeType[PrivilegeType["WRITE"] = 2] = "WRITE";
    PrivilegeType[PrivilegeType["ADMIN"] = 3] = "ADMIN";
})(exports.PrivilegeType || (exports.PrivilegeType = {}));
var PrivilegeType = exports.PrivilegeType;
/**
* A class that is used to describe the project model
*/
var Project = (function () {
    /**
    * Creates an instance of a project
    */
    function Project(userID, buildID) {
        this.user = userID;
        this.buildId = buildID;
        this.name = "";
        this.description = "";
        this.image = "";
        this.imagePath = "";
        this.category = "";
        this.sub_category = "";
        this.website_category = "";
        this.website_img = "";
        this.visibility = "";
        this.rating = 0;
        this.suspicious = 0;
        this.deleted = 0;
        this.type = 0;
        this.tags = [];
        this.createdOn = Date.now();
        this.lastModified = Date.now();
        this.plugins = [];
        this.files = [];
        this.read_privileges = [];
        this.write_privileges = [];
        // Give the user who created the projct admin rights
        this.admin_privileges = [userID.toString()];
    }
    return Project;
})();
exports.Project = Project;
