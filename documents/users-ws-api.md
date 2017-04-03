Users Websocket API
===================

This document describes how to connect to the websocket API of the users server. The socket API is useful for
communicating events from the user server to any clients that connect to it. Its also a secure way of interacting
with the server without having to use TCP protocols.

## Socket API Configuration

To connect to the API you need to know what port its using as well as the host name. You can find this information
from the config.json that is provided to users server on startup. You can find an example config [here](../dist/example-config.json).
Specifically you're looking for the section:

```
"websocket": {
    "port": 8080,
    "approvedSocketDomains": [
        "localhost",
        "^ws://www.webinate.net:123$",
        "^webinate\\.net:80$",
        "^example\\.com$",
        "^.+\\.example\\.com$",
        "^example\\.org",
        "^.+\\.example\\.org",
    ]
}
```

The websocket properties above are described below:

* port - The port the web socket is listening on
* approvedSocketDomains - An array of regular expression strings of approved domains. This list is matched against
any incomming socket request's origin. If anyone of them match, then the connection is allowed - if not then the connection is closed.

## Connecting to the API

Now that you know where to get the config properties from you can open a basic websocket.
In the example below we use the npm module [ws](https://github.com/websockets/ws).


```
var ws = require('ws');

// This URL is based on the host & port of your config
var socketUrl = "ws://localhost:8020";

// Make sure the origin is set, and added to the approvedSocketDomains of the users config
wsClient = new ws( socketUrl, { headers: { origin: "trusted-host" } });

wsClient.on('open', function () {
    // The connection has been opened
});

wsClient.on('error', function (err) {
    // Something went wrong
});

wsClient.on('close', function () {
    // The connection has been closed
});

wsClient.on('message', function (data) {
    // The server sent you an event
    var event = JSON.parse(data);

    // Do something based on the event type:
    event.eventType;
});

```

## Sending a message to users

You can send users a message from the socket api. Below is an example of how to do it. Note however that the server
only accepts data in the format of the [events](../src/definitions/custom/definitions.d.ts/#L11) interfaces. Let's look at the example
of the echo event IEchoEvent.

```

wsClient..on('message', function (data) {

    // The server sent you an event
    var echoEvent = JSON.parse(data);

    // Do something based on the event type:
    if ( echoEvent.eventType === 10 )
        console.log('We got an echo: ' + echoEvent.message );
});

wsClient.send(JSON.stringify({ eventType: 10, message : "Hello world?" })

```

Notice how we are sending the eventType and as well as checking it on the message receiver. The eventType is a number
that identifies the socket event type.

You can get a breakdown of all event types as well as all their other properties from [here](../src/socket-event-types.ts/#L6)
