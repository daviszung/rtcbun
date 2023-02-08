const rooms = {};

// http server
Bun.serve({
  port: 5000,
  fetch(req, server) {
    console.log({req})

    return new Response('meow', {
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
    // could use the url parameters to set up different rooms
    const url = new URL(req.url)
    if (server.upgrade(req, {
      data: {
        name: url.searchParams.get("name") || "unnamed"
      }
    })) {
      return;
    }
    return new Response("Expected a websocket connection", { status: 400 })
  },
  websocket: {
    open(ws) {
      console.log("WebSocket opened");
      ws.subscribe('chat')
    },
    message(ws, message) {
      console.log({message})
      const messageObject = {
        name: ws.data?.name,
        message: message
      };
      const messageString = JSON.stringify(messageObject);
      ws.publish('chat', messageString)
    },
    close(ws, code, reason) {
      ws.publish('chat', `${ws.data?.name} left the chat`)
    },
    drain(ws) {
      console.log("Please send me data. I am ready to receive it.")
    }
  }
});