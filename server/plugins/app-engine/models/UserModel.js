var mongodb = require("mongodb");
/**
* Describes the different types of users
*/
var UserType = (function () {
    function UserType() {
    }
    UserType.ADMIN = "admin";
    UserType.REGULAR = "regular";
    return UserType;
})();
exports.UserType = UserType;
;
/**
* Describes the different plans available to users
*/
var PlanType = (function () {
    function PlanType() {
    }
    PlanType.PLATINUM = "animate-platinum";
    PlanType.GOLD = "animate-gold";
    PlanType.SILVER = "animate-silver";
    PlanType.BRONZE = "animate-bronze";
    PlanType.FREE = "animate-free";
    return PlanType;
})();
exports.PlanType = PlanType;
;
/**
* A class that is used to describe the user model
*/
var User = (function () {
    /**
    * Creates an instance of the user class
    */
    function User(isAdmin) {
        if (isAdmin === void 0) { isAdmin = false; }
        this.username = "";
        this.password = "";
        this.email = "";
        this.bio = "";
        this.image = "media/blank-user.png";
        this.imagePath = "";
        this.tag = "";
        this.userType = UserType.REGULAR;
        this.plan = PlanType.FREE;
        this.registerKey = "";
        this.website = "";
        this.customerId = "";
        this.curSubscription = "";
        this.maxProjects = 1;
        this.createdOn = Date.now();
        this.lastModified = Date.now();
        if (isAdmin)
            this._id = User.adminId;
    }
    User.adminId = new mongodb.ObjectID("000000000000000000000000");
    return User;
})();
exports.User = User;
