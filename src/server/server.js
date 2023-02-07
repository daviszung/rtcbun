Bun.serve({
  port: 8080,
  fetch(req, server) {
    if (server.upgrade(req)) {
      return;
    }
    return new Response("No no no no")
  },
  websocket: {
    open(ws) {
      console.log("WebSocket opened");

      ws.subscribe('chat')
    },
    message(ws, message) {
      ws.publish('chat', `${ws.data.name}: ${message}`)
    },
    close(ws, code, reason) {
      ws.publish('chat', `${ws.data.name} left the chat`)
    },
    drain(ws) {
      console.log("Please send me data. I am ready to receive it.")
    }
  }
})