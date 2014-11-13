# Bashoto Javascript Library

This is a library for the Bashoto API to enable applications to leverage
local communication. To use this library registration is required at https://bashoto.com
to obtain an ApplicationKey.

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

## API Documentation

For API Documnetation please see here: http://bashoto-js.readthedocs.org/en/latest/docs/api/ 

