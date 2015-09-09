/**
* Singleton service for communicating with a webinate-users server
*/
var Utils = (function () {
    function Utils() {
    }
    /**
    * Checks a string to see if its a valid mongo id
    * @param {string} str
    * @returns {boolean} True if the string is valid
    */
    Utils.isValidObjectID = function (str) {
        if (str === void 0) { str = ""; }
        // coerce to string so the function can be generically used to test both strings and native objectIds created by the driver
        str = str.trim() + '';
        var len = str.length, valid = false;
        if (len == 12 || len == 24)
            valid = /^[0-9a-fA-F]+$/.test(str);
        return valid;
    };
    return Utils;
})();
exports.Utils = Utils;
