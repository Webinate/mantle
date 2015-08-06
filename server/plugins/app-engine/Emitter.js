var Emitter = (function () {
    function Emitter() {
        this._listeners = [];
        this.disposed = false;
    }
    Object.defineProperty(Emitter.prototype, "listeners", {
        /**
        * Returns the list of {Array<{ name: string; f: Function; }>} that are currently attached to this dispatcher.
        */
        get: function () {
            return this._listeners;
        },
        enumerable: true,
        configurable: true
    });
    /**
    * Adds a new listener to the dispatcher class.
    */
    Emitter.prototype.addListener = function (name, f, context) {
        if (!f)
            throw new Error("You cannot have an undefined function.");
        this._listeners.push({ name: name, f: f, context: context });
    };
    /**
    * Adds a new listener to the dispatcher class.
    */
    Emitter.prototype.removeListener = function (name, f, context) {
        var listeners = this.listeners;
        if (!f)
            throw new Error("You cannot have an undefined function.");
        var i = listeners.length;
        while (i--) {
            var l = listeners[i];
            if (l.name == name && l.f == f && l.context == context) {
                listeners.splice(i, 1);
                return;
            }
        }
    };
    /**
    * Sends a message to all listeners based on the eventType provided.
    * @param {String} The trigger message
    * @param {Event} event The event to dispatch
    * @returns {any}
    */
    Emitter.prototype.emit = function (name) {
        var argArray = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            argArray[_i - 1] = arguments[_i];
        }
        if (this._listeners.length == 0)
            return null;
        //Slice will clone the array
        var listeners = this._listeners.slice(0);
        if (!listeners)
            return null;
        var toRet = null;
        var i = listeners.length;
        while (i--) {
            var l = listeners[i];
            if (l.name == name) {
                if (!l.f)
                    throw new Error("A listener was added for " + name + ", but the function is not defined.");
                toRet = l.f.call(l.context || this, argArray);
            }
        }
        return toRet;
    };
    /**
    * This will cleanup the component by nullifying all its variables and clearing up all memory.
    */
    Emitter.prototype.dispose = function () {
        this._listeners = null;
        this.disposed = true;
    };
    return Emitter;
})();
module.exports = Emitter;
