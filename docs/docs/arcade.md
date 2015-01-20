# Bashoto ArcadeJavascript Library

These docs are still a work in progress, bit should give you an idea of how things are going to look

This is a library for the Bashoto Arcade API for local leaderboards. 
To use this library registration is required at [https://arcade.bashoto.com](https://arcade.bashoto.com)
to obtain an ApplicationKey.

[View the source here](https://github.com/Bashoto/bashoto-js) 

### Usage

```
var bashoto = new Bashoto("APP-KEY");
bashoto.locate({
    success: function() {
        var board = bashoto.leaderboard(); 
        board.pull(function(scores) {
            alert("Look at these scores! "+scores.local)
        });
    }
});
...
board.push({player: 'player-1', score: 22});
```

# Bashoto Constructor

```
var bashoto = new Bashoto(ApplicationKey, *BashotoOptions*);
```

Creates a Bashoto object for the account associated with the Application key. 
This object is used to generate Topics for messaging.

### **ApplicationKey** *String*

Key used to connect to the Bashoto Core Messaging service. This comes from 
manage.bashoto.com and specific to your application.

### **BashotoOptions** *JSON* ***(Optional)***

#### - locate: [*LocateOptions*](arcade.md#locate) 

Calls the locate(range) method during construction and registers the location from 
the browser to establish local communication. See [locate()](arcade.md#locate).


# Locate

```
bashoto.locate(*LocateOptions*);
```

Locates where the client is being accessed from via HTML5 Geolocation. If geolocation was successful,
any topic that is subscribed to will communicate with other nearby client. If unsuccessful, an error
handler is executed as defined in BashotoOptions of the constructor. If no handlers are given, the
error is just logged to the console and new topics will continue to be global. Here is the HTML5 Geolocation
spec for reference. http://dev.w3.org/geo/api/spec-source.html

#### - success: *callback()* 

Function that is called if Geolocation was successful. Useful to delay subscriptions
until after the user accepts geolocation.

#### - error: *callback(error)* 

Function that is called if Geolocation fails. This function will be the default callback
for all Geolocation errors and takes precedence over errors.error. The default is to log 
the error to the console. Each error object has a message property. If different behaviors
are desired for each different type of possible geolocation error, pass the errors property
in LocateOptions as detailed below


#### - errors: *JSON*

    bashoto.locate({ errors.unsupported: function(error) {console.log(error.message);} };

An errors object can be passed with callbacks that are executed when a specific error 
is raised during the geolocation request. You can handle each error individually or
just implement the errors.error callback. Each callback is passed an error object with
a message property. http://dev.w3.org/geo/api/spec-source.html#position_error_interface


##### -- *errors.error: callback(error)*

Provide a callback for default errors during geolocation. If this is not set. the error is logged to the console.

##### -- *errors.permission: callback(error)*

The location acquisition process failed because the document does not have permission to use the Geolocation API.

##### -- *errors.position: callback(error)*

The position of the device could not be determined. For instance, one or more of the location providers used in the location acquisition process reported an internal error that caused the process to fail entirely.

##### -- *errors.timeout: callback(error)*

The length of time specified by the timeout property has elapsed before the implementation could successfully acquire a new Position object.

##### -- *errors.unknown: callback(error)*

An unknown error occured when requesting location.

##### -- *errors.unsupported: callback(error)*

The current browser does not support HTML5 Geolocation. This is not a standard w3 PositionError, but will still
contain a message.

# Leaderboard

```
var board = bashoto.leaderboard(*LeaderboardOptions*)
```

Gets a leaderboard for push/pull calls. Any options supplied here will be the defaults
unless specific options are supplied in the push/pull options.

### **Leaderboard Options** *JSON* ***(Optional)***

These are the common LeaderBoard options, though any attribute supplied will be propogated to push/pull calls/

#### - board: [*Slug*](https://en.wikipedia.org/wiki/Semantic_URL#Slug)

The name of the board to bind to. This should be supplied as a slug and if it is not, it will be converted to one.
Boards are logical separators for scores, so things like levels or games are good examples of boards.


#### - lat *double*
#### - lon *double*

If both of these are supplied, all push/pull calls will be tied to these coordinates unless otherwise specified.
You want these coordinates to be your devices location because when you sumbit a score it will be assoicated with these.
If bashoto.locate() was used, these values will override the ones from .locate() for all leaderboard calls.
If there is no lat/lon attributes in the options or the push/pull options, all scores submitted will only go to the global leaderboard and 
all pushes will only contain the global leaderboard object.


# Push

```
board.push(Score, Handler, *PushOptions*)
```

Submits a score to the given board

Publishs a message to the associated topic. This message will not be recieved by
this Topic object. If messages are published to the Topic before connecting has finished,
they will be queued up and sent on connection.

### **Score** *JSON*

Both the 'player' and 'score' attributes are required. Player should be a slug and score should be a number.
Any other attributes will be interpretated as PushOptions

### **Handler** *callback(response)*

Function to be called after the score is retrieved. It is filled with a response object which will have attributes about the request.
The response WILL NOT contain a leaderboard, a pull call is necessary to get a leaderboard

### **PushOptions** *JSON* ***(Optional)***

Override for any LeaderboardOptions such as board, lat and lon.

# Pull 
```
topic.pull(Handler, *PullOptions*);
```

### **Handler** *callback(scores)*

Function to be executed once the scores are received. The scores object will contain arrays of scores ordered by rank.
score.local and scores.global will both be arrays in addition to scores.regional. Each array will be an array of JSON
object with attributes like player, score, rank and timestamp.

### **PullOptions** *JSON* ***(Optional)***

Override for any LeaderboardOptions such as board, lat and lon.
