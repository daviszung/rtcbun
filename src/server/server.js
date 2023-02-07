Bun.serve({
  port: 8080,
  fetch(req, server) {
    // could use the url parameters to set up different rooms
    console.log(req.url)
    if (server.upgrade(req, {
      data: {
        name: new URL(req.url).searchParams.get("name") || "friend"
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
      console.log({ws}, {message})
      ws.publish('chat', `${ws.data?.name}: ${message}`)
    },
    close(ws, code, reason) {
      ws.publish('chat', `${ws.data?.name} left the chat`)
    },
    drain(ws) {
      console.log("Please send me data. I am ready to receive it.")
    }
  }
})