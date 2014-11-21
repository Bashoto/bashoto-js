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
