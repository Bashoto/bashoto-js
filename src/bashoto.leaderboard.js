/*global $:false */
function initBashotoLeaderboard (context) {

    'use strict';

    var Bashoto = context.Bashoto;
    var LeaderboardApi = "http://bashoto-arcade.herokuapp.com/api/leaderboard/";

    // No-op callback
    function noop() {}


    // Get a formatted handlers obejct
    function getHandlers(hndlrs) {
        //TODO: Add debug and info
        var handlers = {
            push: noop,
            pull: noop
        };
        if (hndlrs.hasOwnProperty('push')) {
            handlers.message = hndlrs.message;
        }
        if (hndlrs.hasOwnProperty('pull')) {
            handlers.open = hndlrs.open;
        }
        return handlers;
    }

    /**
     * @constructor
     */
    var leaderboard = Bashoto.Leaderboard = function(appKey, handlers, opts) {
        handlers = handlers || {};
        this._opts = opts || {};
        this._handlers = getHandlers(handlers);
        this._url = LeaderboardApi + appKey;
        return this;
    };

    leaderboard.prototype.push = function(handler, score, options) {
        var opts = $.extend(options, this._opts);
        if (!(score.name || score.score)) {
            throw "Score object must contain both attributes 'name' and 'score'";
        }
        opts = $.extend(opts, score);
        $.getJSON(this._url, opts, function(data) {
            handler(data.leaderboard);
            this._handlers.push(data.leaderboard);
        }).fail( function(error) {
            throw error;
        });
    };

    leaderboard.prototype.pull = function(handler, options) {
        var opts = $.extend(options, this._opts);
        console.log(opts);
        $.post(this._url, opts, function(data) {
            handler(data.leaderboard);
            this._handlers.pull(data.leaderboard);
        }, 'json').fail( function(error) {
            console.log(error.error());
        });
    };

    // BASHOTO PROTOTYPE METHODS
    //
    //
    Bashoto.prototype.leaderboard = function (options) {
        var opts = options || {};
        if (this._geo) {
            opts.lat = opts.lat || this._geo.latitude;
            opts.lon = opts.lon || this._geo.longitude;
        }
        var handlers = opts.handlers || {};
        if (opts.handlers) {
            delete opts.handlers;
        }
        var board = new Bashoto.Leaderboard(this.getAppKey(), handlers, opts);
        return board;
    };

    if (DEBUG) {
        // DEBUG CODE
        //
        // Each module can have its own debugging section.  They all get compiled
        // out of the binary.
    }

}
