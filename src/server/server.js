let numOfRooms = 0;
const rooms = {};

// http server
Bun.serve({
  port: 5000,
  fetch(req, server) {
    const url = new URL(req.url);
    console.log({req})

    return new Response(`Meow`, {
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
      // destructure data from client ws connection
      const { name, room } = ws.data;

      // create room or add name to room
      if (rooms[room]) {
        rooms[room].push(name)
      } else {
        rooms[room] = [name]
      }

      console.log("WebSocket opened");
      ws.subscribe(room)
    },

    message(ws, message) {
      console.log({ws})
      console.log({message})
      const messageObject = {
        name: ws.data?.name,
        message: message
      };
      const messageString = JSON.stringify(messageObject);
      ws.publish(ws.data.room, messageString)
    },

    close(ws, code, reason) {
      ws.publish(ws.data.room, `${ws.data?.name} left the chat`)
    },

    drain(ws) {
      console.log("Please send me data. I am ready to receive it.")
    }
  }
});