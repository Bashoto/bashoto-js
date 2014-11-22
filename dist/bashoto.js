/*! bashoto-js - v0.0.2 - 2014-11-22 - Buck Heroux */
;(function (global) {

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

    Bashoto.HOST = "https://bashoto.com";

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

/*global $:false */
function initBashotoTopic (context) {

    'use strict';

    var Bashoto = context.Bashoto;

    // No-op callback
    function noop() {}


    // Get a formatted handlers obejct
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
     * @constructor
     */
    var topic = Bashoto.Topic = function(appKey, handlers, opts) {
        opts = opts || {};
        handlers = handlers || {};
        this._handlers = getHandlers(handlers);
        this._openqueue = [];
        this._ons = {};
        this._bindsocket(appKey, opts);
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
        if (typeof(msg) === "object") {
            msg = JSON.stringify(msg);
        }
        if (!this.isOpen()) {
            this._openqueue.push(msg);
        } else {
            this._socket.send(msg);
        }
    };

    topic.prototype.close = function() {
        if (this.isOpen()) {
            this._socket.close();
        }
    };

    topic.prototype.isOpen = function() {
        return this._socket && this._socket.readyState === 1;
    };

    // PRIVATE TOPIC METHODS
    //

    topic.prototype._bindsocket = function(appKey, opts) {
        var _topic = this;
        var url = Bashoto.HOST+"/io/topic/"+appKey+"?callback=?";
        $.getJSON(url, function(response) {
            var ws_url = response.response.url+"?"+$.param(opts); 
            var socket = new WebSocket(ws_url);
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
                try {
                    msg = JSON.parse(message.msg);
                } catch(e) { /*stays a string*/ }
                _topic._handlers.message(msg);
            };
            _topic._socket = socket;
        });
    };

    // BASHOTO PROTOTYPE METHODS
    //
    //
    Bashoto.prototype.subscribe = function (handlers, options) {
        var opts = options || {};
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
