# Bashoto Javascript Library

This is a library for the Bashoto API to enable applications to leverage
local communication. To use this library registration is required at https://bashoto.com
to obtain an ApplicationKey. Currently ApplicationKeys are being distributed through 
a closed beta program. To participate in the program, sign up at https://bashoto.com

## API Documentation

For API Documentation please see here: http://bashoto-js.readthedocs.org/en/latest/docs/api/ 

### Usage
    var bashoto = new Bashoto("APP-KEY");
    bashoto.locate();
    var topic = bashoto.subscribe({ 
        message: function(msg) {
            alert("We got a message! "+msg)
        };
    }, {name: "Test"});
    ...
    topic.publish("Hey!");

### JSFiddle

You can fiddle around here http://jsfiddle.net/z7vyL22k/18/

This has two topics that communicate with eachother in the same browser.
If you access from another nearby device or window, you'll see those messages also,
but doubled because each topic is recieving them and appending them to the same list.

## Concepts

Bashoto implements [a pub/sub architecture](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern)
where the client subscribes to a Topic based on their location and with options to such as name and range.
The topic is the communication mechanism for bashoto and is registered with callbacks on how to behave
when a message is recieved from the topic, when the topic is open, closed and on errors. The topic is
also used to publish messages to nearby clients that have same topic options. For questions contact support@bashoto.com.

