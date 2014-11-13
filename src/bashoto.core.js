// Compiler directive for UglifyJS.  See library.const.js for more info.
if (typeof DEBUG === 'undefined') {
    DEBUG = true;
}

// GLOBAL is a reference to the global Object.
var Fn = Function, GLOBAL = new Fn('return this')();

/*global console */
function initBashotoCore (context) {

    // It is recommended to use strict mode to help make mistakes easier to find.
    'use strict';

    // Format the errrors object properly for locate()
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

    // Get the supplied application key
    Bashoto.prototype.getAppKey = function () {
        return this._appKey;
    };

    // Use HTML5 Geolocation to associate this object with a location
    Bashoto.prototype.locate = function(options) {
        var opts = options || {};
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
            success();
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

    if (DEBUG) {
        //GLOBAL.corePrivateMethod = corePrivateMethod;
    }

}
