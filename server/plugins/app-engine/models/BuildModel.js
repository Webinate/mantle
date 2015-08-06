/**
* Describes the current developmental state of a build
*/
var BUILD_STATE = (function () {
    function BUILD_STATE() {
    }
    BUILD_STATE.DEVELOPMENT = "development";
    return BUILD_STATE;
})();
exports.BUILD_STATE = BUILD_STATE;
;
/**
* Describes the different levels of visibility of a build
*/
var BUILD_VISIBILITY = (function () {
    function BUILD_VISIBILITY() {
    }
    BUILD_VISIBILITY.PUBLIC = "Public";
    BUILD_VISIBILITY.PRIVATE = "Private";
    return BUILD_VISIBILITY;
})();
exports.BUILD_VISIBILITY = BUILD_VISIBILITY;
;
/**
* A class that is used to describe the build model
*/
var Build = (function () {
    /**
    * Creates an instance of a build
    */
    function Build(projectId, version) {
        if (projectId === void 0) { projectId = undefined; }
        if (version === void 0) { version = "0.0.1"; }
        this.name = "";
        this.projectId = projectId;
        this.state = BUILD_STATE.DEVELOPMENT;
        this.html = "";
        this.css = "";
        this.liveHTML = "";
        this.liveLink = "";
        this.liveToken = Build.generateToken(7);
        this.visibility = BUILD_VISIBILITY.PRIVATE;
        this.rating = 0;
        this.build_notes = "";
        this.version = version;
        this.createdOn = Date.now();
        this.lastModified = Date.now();
    }
    /**
    * Use this function to generate a random token string
    * @param {number} length The length of the password.
    * @returns {string}
    */
    Build.generateToken = function (length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    };
    return Build;
})();
exports.Build = Build;
