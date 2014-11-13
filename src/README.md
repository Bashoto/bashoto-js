# src

This is the source directory.  Uncompiled source files for the library go here.
Please note the external dependency files do not belong here, those go in
`vendor/`.


# Proposed API

    var latlon = {lat: LAT, lon: LON}
    var bashoto = new Bashoto(APPKEY);
    var topic = {
        name: 'some-topic',
        location: latlon,
        on: function(data) {
            console.log("recieved some data! "+data);
        }
    }
    var socket = bashoto.subscribe(topic)

    socket.on('msg', function(msg) {
       alert("got a message!: "+msg) 
    });

    socket.on('info', function(info) {
        alert("got some info!: "+info)    
    })

    socket.send({'msg': 'Hey!'})
    topic.drop('info')
    socket.send({'info': 'Hey!'})
    socket.close();
