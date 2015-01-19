/*global $:false */
function initBashotoLeaderboard (context) {

    'use strict';

    var Bashoto = context.Bashoto;
    var LeaderboardApi = "https://bashoto-arcade.herokuapp.com/api/leaderboard/";

    // No-op callback
    function noop() {}

    /**
     * @constructor
     */
    var leaderboard = Bashoto.Leaderboard = function(appKey, opts) {
        this._opts = opts || {};
        this._url = LeaderboardApi + appKey ;
        return this;
    };

    leaderboard.prototype.push = function(score, handler, options) {
        if (!(score.name || score.score)) {
            throw "Score object must contain both attributes 'name' and 'score'";
        }
        var opts = $.extend(options || {}, score, this._opts);
        handler = handler || noop;
        $.post(this._url, opts, function(data) {
            handler(data.response.leaderboards);
        }, 'json').fail( function(error) {
            throw JSON.parse(error.responseText);
        });
    };

    leaderboard.prototype.pull = function(handler, options) {
        var opts = $.extend(options || {}, this._opts);
        handler = handler || noop;
        $.getJSON(this._url, opts, function(data) {
            handler(data.response.leaderboards);
        }).fail( function(error) {
            throw JSON.parse(error.responseText);
        });
    };

    // BASHOTO PROTOTYPE METHODS
    //
    Bashoto.prototype.leaderboard = function (options) {
        var opts = options || {};
        if (this._geo) {
            opts.lat = opts.lat || this._geo.latitude;
            opts.lon = opts.lon || this._geo.longitude;
        }
        var board = new Bashoto.Leaderboard(this.getAppKey(), opts);
        return board;
    };

    if (DEBUG) {
    }

}
