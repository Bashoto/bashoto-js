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
    Bashoto.prototype.locate = function(options) {
        var opts = options || {}
        var rng = opts.range || Bashoto.LOCAL;
        var success = opts.success || function() {};
        var errors = getErrorHandlers(opts.errors || {});
        errors.error = opts.error || errors.error;
        var _bashoto = this;
        if (!navigator.geolocation) {
            if (errors.unsupported) {
                errors.unsupported({});
            } else {
                errors.error({message: "The browser does not support Geolocation"});
            }
        }
        navigator.geolocation.getCurrentPosition(function(pos) {
            _bashoto._geo = pos.coords;
            _bashoto._geo.range = rng;
            callback();
        }, function(error) {
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    if (errors.permission) {
                        errors.permission(error);
                    } else {
                        errors.error(error);
                    }
                    break;
                case error.POSITION_UNAVAILABLE:
                    if (errors.position) {
                        errors.permission(error);
                    } else {
                        errors.error(error);
                    }
                    break;
                case error.TIMEOUT:
                    if (errors.timeout) {
                        errors.timeout(error);
                    } else {
                        errors.error(error);
                    }
                    break;
                case error.UNKNOWN_ERROR:
                    if (errors.unknown) {
                        errors.unknown(error);
                    } else {
                        errors.error(error);
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
