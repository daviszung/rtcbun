// track the number of rooms
let numOfRooms = 0;

// http server
Bun.serve({
  port: 5000,
  fetch(req, server) {
    numOfRooms += 1;
    return new Response(`${numOfRooms}`, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "content-type": "text/plain"
      }
    })
  },
  error () {
    return new Response("error in http server")
  }
});


// websocket server
Bun.serve({
  port: 8080,
  fetch(req, server) {
    const url = new URL(req.url);
    if (server.upgrade(req, {
      data: {
        name: url.searchParams.get("name") || "unnamed",
        room: url.searchParams.get("room") || "test"
      }
    })) {
      return;
    }
    return new Response("Expected a websocket connection", { status: 400 })
  },
  websocket: {
    open(ws) {

      console.log(`New ws connection, user (${ws.data?.name}) subscribed to room (${ws.data?.room})`);

      ws.subscribe(ws.data.room);

      const messageObject = {
        name: "SERVER",
        message: `${ws.data?.name} joined the room`
      };

      const joinMessage = JSON.stringify(messageObject);

      ws.publish(ws.data.room, joinMessage);
    },

    message(ws, message) {

      const messageObject = {
        name: ws.data?.name,
        message: message
      };

      const messageString = JSON.stringify(messageObject);

      ws.publish(ws.data.room, messageString);
    },

    close(ws, code, reason) {

      console.log(`connection closed in room ${ws.data?.room}`);

      const messageObject = {
        name: "SERVER",
        message: `${ws.data?.name} left the room`
      };

      const closeMessage = JSON.stringify(messageObject);

      ws.publish(ws.data.room, closeMessage);
    },

    drain(ws) {
      console.log("Please send me data. I am ready to receive it.")
    }
  },
  error() {
    console.log("Error in WebSocket Server")
    return new Response("Error in WebSocket Server")
  }
});