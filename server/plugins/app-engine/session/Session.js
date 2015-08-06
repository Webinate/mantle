var Model = require('../models/Model');
var utils = require('../Utils');
/**
* Checks if the object o has the property p
* @returns {boolean}
*/
function ownProp(o, p) {
    return Object.prototype.hasOwnProperty.call(o, p);
}
/**
* Manages each of the sessions
*/
var SessionManager = (function () {
    function SessionManager() {
        this.sessions = {};
        this._sessionCollection = Model.getSingleton().collection("sessions");
    }
    /**
    * Creates or fetches a session object by looking at the headers of a request
    * @returns {Session}
    */
    SessionManager.prototype.lookupOrCreate = function (request, opts, callback) {
        var that = this;
        var id;
        var session;
        var that = this;
        opts = opts || {};
        var sessionCreated = function (session, dbEntry) {
            if (!session)
                session = new Session(opts.sessionID ? opts.sessionID : that.createID(), opts);
            // If it was loaded in the DB, then set its properties from the saved results
            if (dbEntry)
                session.open(dbEntry);
            // Reset the expiration date for the session
            session.expiration = (new Date(Date.now() + session.lifetime * 1000)).getTime();
            callback(null, session);
            if (!session.data) {
                // Adds / updates the DB with the new session
                that._sessionCollection.remove({ id: session.id }, function (err, result) {
                    if (err)
                        console.log(utils.ConsoleStyles.red[0] + "Could not remove session : '" + err + "'" + utils.ConsoleStyles.red[1]);
                    else if (result === 0)
                        console.log(utils.ConsoleStyles.red[0] + "No Sessions were deleted" + utils.ConsoleStyles.red[1]);
                });
            }
            else {
                // Adds / updates the DB with the new session
                that._sessionCollection.update({ id: session.id }, session.save(), { upsert: true }, function (err, result) {
                    if (err || !result)
                        callback("Could not save session to the model: '" + err + "'", null);
                    else {
                        // make sure a timeout is pending for the expired session reaper
                        if (!that._timeout)
                            that._timeout = setTimeout(that.cleanup.bind(that), 60000);
                    }
                });
            }
        };
        // See if the client has a session id - then get the session data stored in the model
        id = this.getIDFromRequest(request);
        if (id != "") {
            this._sessionCollection.find({ id: id }, function (err, result) {
                // Cant seem to find any session - so create a new one
                if (err || !result)
                    sessionCreated(null);
                else {
                    result.nextObject(function (err, sessionEntry) {
                        if (err || !result)
                            sessionCreated(null);
                        else
                            sessionCreated(new Session(id, opts), sessionEntry);
                    });
                }
            });
        }
        else
            sessionCreated(null);
    };
    /**
    * Each time a session is created, a timer is started to check all sessions in the DB.
    * Once the lifetime of a session is up its then removed from the DB and we check for any remaining sessions.
    */
    SessionManager.prototype.cleanup = function (force) {
        if (force === void 0) { force = false; }
        var that = this;
        var id, now, next;
        now = +new Date;
        next = Infinity;
        this._timeout = null;
        that._sessionCollection.find(function (err, result) {
            result.toArray(function (err, sessions) {
                // Remove query
                var toRemoveQuery = { $or: [] };
                for (var i = 0, l = sessions.length; i < l; i++) {
                    var exp = parseFloat(sessions[i].expiration);
                    if (exp < now || force)
                        toRemoveQuery.$or.push({ _id: sessions[i]._id });
                    else
                        next = next < exp ? next : exp;
                }
                // Check if we need to remove sessions - if we do, then remove them :)
                if (toRemoveQuery.$or.length > 0) {
                    that._sessionCollection.remove(toRemoveQuery, function (err, result) {
                        if (err)
                            console.log(utils.ConsoleStyles.red[0] + "Could not remove session : '" + err + "'" + utils.ConsoleStyles.red[1]);
                        else if (result === 0)
                            console.log(utils.ConsoleStyles.red[0] + "No Sessions were deleted" + utils.ConsoleStyles.red[1]);
                    });
                }
            });
        });
        if (next < Infinity)
            this._timeout = setTimeout(this.cleanup.bind(this), next - (+new Date) + 1000);
    };
    /**
    * Looks at the headers from the HTTP request to determine if a session cookie has been asssigned and returns the ID.
    * @param {http.ServerRequest} req
    * @returns {string}
    */
    SessionManager.prototype.getIDFromRequest = function (req) {
        var m;
        // look for an existing SID in the Cookie header for which we have a session
        if (req.headers.cookie && (m = /SID=([^ ,;]*)/.exec(req.headers.cookie)))
            return m[1];
        else
            return "";
    };
    /**
    * Creates a random session ID unless one is given
    * @returns {string}
    */
    SessionManager.prototype.createID = function () {
        // otherwise a 64 bit random string is used
        return this.randomString(64);
    };
    /**
    * Creates a pseude-random ASCII string which contains at least the specified number of bits of entropy
    * the return value is a string of length ⌈bits/6⌉ of characters from the base64 alphabet
    * @param {number} bits The number of bits for this random string
    * @returns {string}
    */
    SessionManager.prototype.randomString = function (bits) {
        var chars, rand, i, ret;
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        ret = '';
        // in v8, Math.random() yields 32 pseudo-random bits (in spidermonkey it gives 53)
        while (bits > 0) {
            rand = Math.floor(Math.random() * 0x100000000); // 32-bit integer
            // base 64 means 6 bits per character, so we use the top 30 bits from rand to give 30/6=5 characters.
            for (i = 26; i > 0 && bits > 0; i -= 6, bits -= 6)
                ret += chars[0x3F & rand >>> i];
        }
        return ret;
    };
    Object.defineProperty(SessionManager, "singleton", {
        /**
        * Gets the SessionManager singleton
        * @returns {SessionManager}
        */
        get: function () {
            if (!SessionManager._singleton)
                SessionManager._singleton = new SessionManager();
            return SessionManager._singleton;
        },
        enumerable: true,
        configurable: true
    });
    return SessionManager;
})();
exports.SessionManager = SessionManager;
/**
* A class to represent session data
*/
var Session = (function () {
    function Session(id, opts) {
        this.id = id;
        this.data = {};
        this.path = opts.path || '/';
        this.domain = opts.domain;
        this.expiration = 0;
        this.secure = opts.secure;
        // if the caller provides an explicit lifetime, then we use a persistent cookie
        // it will expire on both the client and the server lifetime seconds after the last use
        // otherwise, the cookie will exist on the browser until the user closes the window or tab,
        // and on the server for 24 hours after the last use
        if (opts.lifetime) {
            this.persistent = opts.persistent;
            this.lifetime = opts.lifetime;
        }
        else {
            this.persistent = false;
            this.lifetime = 86400;
        }
    }
    Session.prototype.open = function (data) {
        this.id = data.id;
        this.data = data.data;
        this.path = data.path;
        this.domain = data.domain;
        this.expiration = data.expiration;
    };
    Session.prototype.save = function () {
        var data = {};
        data.id = this.id;
        data.data = this.data;
        data.path = this.path;
        data.domain = this.domain;
        data.expiration = this.expiration;
        return data;
    };
    /**
    * This method returns the value to send in the Set-Cookie header which you should send with every request that goes back to the browser, e.g.
    * response.setHeader('Set-Cookie', session.getSetCookieHeaderValue());
    */
    Session.prototype.getSetCookieHeaderValue = function () {
        var parts;
        parts = ['SID=' + this.id];
        if (this.path)
            parts.push('path=' + this.path);
        if (this.domain)
            parts.push('domain=' + this.domain);
        if (this.persistent)
            parts.push('expires=' + this.dateCookieString(this.expiration));
        if (this.secure)
            parts.push("secure");
        return parts.join('; ');
    };
    /**
    * Converts from milliseconds to string, since the epoch to Cookie 'expires' format which is Wdy, DD-Mon-YYYY HH:MM:SS GMT
    */
    Session.prototype.dateCookieString = function (ms) {
        var d, wdy, mon;
        d = new Date(ms);
        wdy = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return wdy[d.getUTCDay()] + ', ' + this.pad(d.getUTCDate()) + '-' + mon[d.getUTCMonth()] + '-' + d.getUTCFullYear()
            + ' ' + this.pad(d.getUTCHours()) + ':' + this.pad(d.getUTCMinutes()) + ':' + this.pad(d.getUTCSeconds()) + ' GMT';
    };
    /**
    * Pads a string with 0's
    */
    Session.prototype.pad = function (n) {
        return n > 9 ? '' + n : '0' + n;
    };
    return Session;
})();
exports.Session = Session;
