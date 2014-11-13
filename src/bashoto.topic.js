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
