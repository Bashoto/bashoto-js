# Bashoto Javascript Library

This is a library for the Bashoto API to enable applications to leverage
local communication. To use this library registration is required at [https://bashoto.com](https://bashoto.com)
to obtain an ApplicationKey.

[View the source here](https://github.com/Bashoto/bashoto-js) 

### Usage

```
var bashoto = new Bashoto("APP-KEY");
bashoto.locate();
var topic = bashoto.subscribe({ 
    message: function(msg) {
        alert("We got a message! "+msg)
    };
}, {name: "Test"});
...
topic.publish("Hey!");
```

# Bashoto Constructor

    var bashoto = new Bashoto(ApplicationKey, *BashotoOptions*);

Creates a Bashoto object for the account associated with the Application key. 
This object is used to generate Topics for messaging.

### **ApplicationKey** *String*

Key used to connect to the Bashoto Core Messaging service. This comes from 
manage.bashoto.com and specific to your application.

### **BashotoOptions** *JSON* ***(Optional)***

#### - locate: [*BashotoRange*](api.md#locate) 

Calls the locate(range) method during construction and registers the location from 
the browser to establish local communication. See [locate()](api.md#locate).


#### - errors: *JSON*

    var opts = { errors.error: function(error) {console.log(error);} };

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


# Locate

```
bashoto.locate(*BashotoRange*);
```

Locates where the client is being accessed from via HTML5 Geolocation. If geolocation was successful,
any topic that is subscribed to will communicate with other nearby client. If unsuccessful, an error
handler is executed as defined in BashotoOptions of the constructor. If no handlers are given, the
error is just logged to the console and new topics will continue to be global. Here is the HTML5 Geolocation
spec for reference. http://dev.w3.org/geo/api/spec-source.html


### **BashotoRange** *BashotoRange* ***(Optional)***

The range of communication with nearby clients. Default is Bashoto.Local which is about neighborhood size.

Possible Range Values:

* **Bashoto.HYPERLOCAL** City Block
* **Bashoto.LOCAL** *(Default)* Neighborhood
* **Bashoto.SUBREGIONAL** City
* **Bashoto.REGIONAL** State
* **Bashoto.CONTINENTAL** Many States
* **Bashoto.HEMISPHERE**
* **Bashoto.GLOBAL**


# Subscribe

```
var topic = bashoto.subscribe(Handlers, *TopicOptions*)
```

Subscribes to a topic and returns a Topic object for communication. This topic 
is associated with the geolocation of the Bashoto object, unless otherwise 
specified. If there is no location associated with the Bashoto object, a global 
topic is used.

### **Handlers** *JSON*

Handlers for Topic communication. At the very least implement the message
handler to communicate with other clients.

```
var topic = bashoto.subscribe({
    message: function(msg) { alert("Got a message! "+msg) },
    close: function(close) { alert("Socket was closed: "+close.reason) },
    error: function(error) { alert("Oh no! An error: "+error) },
    open: function(open) { console.log("Topic has been opened!") },
});
```

#### - message: *callback(msg)*

Callback handler for when a message is recieved. This should be implemented. The msg passed
to your callback will be a string or JSON object depending on how the other client sent it.

#### - open: *callback(open)*

An event listener to be called when the Topic connection has connected and been opened; this indicates that the connection is ready to send and receive data.

#### - close: *callback(close)*

An event listener to be called when the Topic has been closed by either the server or client. 
The listener receives a CloseEvent https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent.

#### - error: *callback(error)*

An event listener to be called when an error occurs during communication.

### **Topic Options** *JSON* ***(Optional)***

Topic options can be passed to create different topics. The highest level is to create a topic name.
Topics with different names do not communicate with eachother. This can be used to segment your clients
on top of the geo-segmentation provided by Bashoto.

#### - name: [*Slug*](https://en.wikipedia.org/wiki/Semantic_URL#Slug)

The name of the topic to bind to. If not supplied, the default name will be used. Two different
topic names do not communicate with one another. The name should be a [slug style String](https://en.wikipedia.org/wiki/Semantic_URL#Slug) or it will be reformatted to one by lowercase and replacing non-word characters with '-'.

#### - lat *double*
#### - lon *double*
#### - range *BashotoRange* **([see locate](api.md#locate))**

If all three of these are provided (lat,lon,range), the topic will be associated with the given location instead
of associated with the Bashoto objects location. It is recommended to use the bashoto.locate()
method to bind to topics by location, but passing these arguments will override that.

#### - global: *Boolean* 

If global: true is provided, it will overrule all other geo settings for this topic and will bind
to the global channel for topic communication.


# Publish

```
topic.publish(Message, *MessageOptions*)
```

Publishs a message to the associated topic. This message will not be recieved by
this Topic object. If messages are published to the Topic before connecting has finished,
they will be queued up and sent on connection.

### **Message** *String or JSON*

A string that will be distributed to other clients bound to this same topic. If JSON objects
are passed, they will be distributed to clients as such.

### **MessageOptions** *JSON* ***(Optional)***

Currently there are no MessageOptions that are implemented. This is reserved for future use
to handle different types of messages.

# Close
```
topic.close();
```
Explicity closes the Topic for communication. If the topic is published to after closing
the socket, an error is thrown.

