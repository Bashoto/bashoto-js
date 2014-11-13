/*! bashoto-js - v0.0.1 - 2014-11-12 - Buck Heroux */
;(function (global) {

// Compiler directive for UglifyJS.  See library.const.js for more info.
if (typeof DEBUG === 'undefined') {
    DEBUG = true;
}


// LIBRARY-GLOBAL CONSTANTS
//
// These constants are exposed to all library modules.


// GLOBAL is a reference to the global Object.
var Fn = Function, GLOBAL = new Fn('return this')();


// LIBRARY-GLOBAL METHODS
//
// The methods here are exposed to all library modules.  Because all of the
// source files are wrapped within a closure at build time, they are not
// exposed globally in the distributable binaries.


/*global console */
/**
 * Init wrapper for the core module.
 * @param {Object} The Object that the library gets attached to in
 * library.init.js.  If the library was not loaded with an AMD loader such as
 * require.js, this is the global Object.
 */
function initBashotoCore (context) {


    // It is recommended to use strict mode to help make mistakes easier to find.
    'use strict';


    // PRIVATE MODULE CONSTANTS
    //


    // An example of a CONSTANT variable;


    // PRIVATE MODULE METHODS
    //
    // These do not get attached to a prototype.  They are private utility
    // functions.

    function getErrorHandlers(errors) {
        var handlers = { error: function(error) { console.log(error); } };
        if (errors.position) {
            handlers.position = errors.position;
        }
        if (errors.permisson) {
            handlers.permission = errors.permission;
        }
        if (errors.timeout) {
            handlers.timeout = errors.timeout;
        }
        if (errors.unknown) {
            handlers.unknown = errors.unknown;
        }
        if (errors.unsupported) {
            handlers.unsupported = errors.unsupported;
        }
        if (errors.error) {
            handlers.error = errors.error;
        }
        return handlers;
    }

    /**
     * This is the constructor for the Bashoto Object.
     * @param {Object} opt_config Contains any properties that should be used to
     * configure this instance of the library.
     * @constructor
     */
    var Bashoto = context.Bashoto = function (app_key, opts) {
        opts = opts || {};
        this._appKey = app_key;
        this._errorHandlers = getErrorHandlers(opts.errors || {});
        if (opts.locate) {
            this.locate(opts.locate);
        }
        return this;
    };

    Bashoto.HOST = "bashoto-core.herokuapp.com";
    Bashoto.PROTOCOL = "wss://";

    // Block - 100m
    Bashoto.HYPERLOCAL = Math.pow(10,2);
    // Neighborhood - 1k
    Bashoto.LOCAL = Math.pow(10,3);
    // City - 10k
    Bashoto.SUBREGIONAL = Math.pow(10,4);
    // State - 100k
    Bashoto.REGIONAL = Math.pow(10,5);
    // Country 1000k
    Bashoto.CONTINENTAL = Math.pow(10,6);
    // Country 10000k
    Bashoto.HEMISPHERE = Math.pow(10,7);
    Bashoto.GLOBAL = 0;


    // Bashoto PROTOTYPE METHODS
    //
    // These methods define the public API.


    /**
     * An example of a protoype method.
     * @return {string}
     */
    Bashoto.prototype.getAppKey = function () {
        return this._appKey;
    };

    Bashoto.prototype.setLocateErrorHandlers = function(handlers) {
        this.handlers = getErrorHandlers(handlers);
    };

    /**
     * An example of a protoype method.
     * @return {string}
     */
    Bashoto.prototype.locate = function(range) {
        var rng = range || Bashoto.LOCAL;
        var _bashoto = this;
        if (!navigator.geolocation) {
            if (this._errorHandlers.unsupported) {
                this._errorHandlers.unsupported({});
            } else {
                this._errorHandlers.error({});
            }
        }
        navigator.geolocation.getCurrentPosition(function(pos) {
            _bashoto._geo = pos.coords;
            _bashoto._geo.range = rng;
        }, function(error) {
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    if (_bashoto._errorHandlers.permission) {
                        _bashoto._errorHandlers.permission(error);
                    } else {
                        _bashoto._errorHandlers.error(error);
                    }
                    break;
                case error.POSITION_UNAVAILABLE:
                    if (_bashoto._errorHandlers.position) {
                        _bashoto._errorHandlers.permission(error);
                    } else {
                        _bashoto._errorHandlers.error(error);
                    }
                    break;
                case error.TIMEOUT:
                    if (_bashoto._errorHandlers.timeout) {
                        _bashoto._errorHandlers.timeout(error);
                    } else {
                        _bashoto._errorHandlers.error(error);
                    }
                    break;
                case error.UNKNOWN_ERROR:
                    if (_bashoto._errorHandlers.unknown) {
                        _bashoto._errorHandlers.unknown(error);
                    } else {
                        _bashoto._errorHandlers.error(error);
                    }
                    break;
            }
        });    
    };

    // DEBUG CODE
    //
    // With compiler directives, you can wrap code in a conditional check to
    // ensure that it does not get included in the compiled binaries.  This is
    // useful for exposing certain properties and methods that are needed during
    // development and testing, but should be private in the compiled binaries.

    if (DEBUG) {
        //GLOBAL.corePrivateMethod = corePrivateMethod;
    }

}

// Your library may have many modules.  How you organize the modules is up to
// you, but generally speaking it's best if each module addresses a specific
// concern.  No module should need to know about the implementation details of
// any other module.

// Note:  You must name this function something unique.  If you end up
// copy/pasting this file, the last function defined will clobber the previous
// one.
/*global $:false */
function initBashotoTopic (context) {

    'use strict';

    var Bashoto = context.Bashoto;


    // A library module can do two things to the Library Object:  It can extend
    // the prototype to add more methods, and it can add static properties.  This
    // is useful if your library needs helper methods.


    // PRIVATE MODULE CONSTANTS
    //


    // PRIVATE MODULE METHODS
    //

    function noop() {}

    function getHandlers(hndlrs) {
        //TODO: Add debug and info
        var handlers = {
            message: noop,
            open: noop,
            close: noop,
            error: noop
        };
        if (hndlrs.hasOwnProperty('message')) {
            handlers.message = hndlrs.message;
        }
        if (hndlrs.hasOwnProperty('open')) {
            handlers.open = hndlrs.open;
        }
        if (hndlrs.hasOwnProperty('close')) {
            handlers.close = hndlrs.close;
        }
        if (hndlrs.hasOwnProperty('error')) {
            handlers.error = hndlrs.error;
        }
        return handlers;
    }

    /**
     * Get the url to connect to.  
     */
    function getSocketUrl(appKey, opts) {
        var params = $.param(opts);
        return Bashoto.PROTOCOL+Bashoto.HOST+"/io/topic/"+appKey+"?"+params;
    }

    // LIBRARY STATIC PROPERTIES
    //


    /**
     * An example of a static Library property.  This particular static property
     * is also an instantiable Object.
     * @constructor
     */
    var topic = Bashoto.Topic = function(appKey, handlers, opts) {
        opts = opts || {};
        handlers = handlers || {};
        this._url = getSocketUrl(appKey, opts);
        this._handlers = getHandlers(handlers);
        this._socket = this._bindsocket();
        this._openqueue = [];
        this._ons = {};
        return this;
    };

    // PUBLIC TOPIC METHODS
    //
    //
    //For future use of event triggering
    //topic.prototype.on = function(name, f) {
    //    this._ons[name] = f;
    //};
    //
    //topic.prototype.drop = function(name) {
    //    delete this._ons[name];
    //};

    topic.prototype.publish = function(msg) {
        if (this._socket.readyState == 0) {
            this._openqueue.push(msg);
        } else {
            this._socket.send(msg);
        }
    };

    topic.prototype.close = function() {
        this._socket.close();
    };

    topic.prototype.isOpen = function() {
        return this._socket.readyState === 1;
    };

    // PRIVATE TOPIC METHODS
    //

    topic.prototype._bindsocket = function() {
        var _topic = this;
        var socket = new WebSocket(_topic._url);
        //open
        socket.onopen = function(msg) {
            // flush openqueue
            while(_topic._openqueue.length > 0) {
                _topic.publish(_topic._openqueue.pop());
            }
            _topic._handlers.open(msg);
        };
        //close
        socket.onclose = function(msg) {
            _topic._handlers.close(msg);
        };
        //error
        socket.onerror = function(msg) {
            _topic._handlers.error(msg);
        };
        //message
        socket.onmessage = function(msgevt) {
            var message = JSON.parse(msgevt.data);
            var msg = message.msg;
            _topic._handlers.message(msg);
        };
        return socket;
    };

    // BASHOTO PROTOTYPE METHODS
    //
    //
    Bashoto.prototype.subscribe = function (handlers, opts) {
        var opts = opts || {};
        if (this._geo) {
            opts.lat = opts.lat || this._geo.latitude;
            opts.lon = opts.lon || this._geo.longitude;
            opts.range = opts.range || this._geo.range;
        }
        if (opts.global) {
            delete opts.range;
        }
        var topic = new Bashoto.Topic(this.getAppKey(), handlers, opts);
        return topic;
    };

    if (DEBUG) {
        // DEBUG CODE
        //
        // Each module can have its own debugging section.  They all get compiled
        // out of the binary.
    }

}

/*global initBashotoCore initBashotoTopic */
var initBashoto = function (context) {

  initBashotoCore(context);
  initBashotoTopic(context);

  return context.Bashoto;
};


if (typeof define === 'function' && define.amd) {
  // Expose Library as an AMD module if it's loaded with RequireJS or
  // similar.
  define(function () {
    return initBashoto({});
  });
} else {
  // Load Library normally (creating a Library global) if not using an AMD
  // loader.
  initBashoto(this);
}

} (this));
