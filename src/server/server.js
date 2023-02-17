// rooms contain up to two users
let rooms = {};
let numOfRooms = 0;
const max = 2;

// add someone to a room or create a room
// takes a user and requested room as input, reqRoom optional
function handleNewUser(user, roomReq = false) {
  // SUCCESS CASE: the user is creating a room
  if (!roomReq) {
    numOfRooms += 1;
    console.log(`creating new room: (${numOfRooms})`);
    rooms[numOfRooms] = [user];
    return new Response(JSON.stringify({
      status: 200,
      message: numOfRooms,
      occupants: rooms[numOfRooms]
    }), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "content-type": "application/json"
      }
    });
  }
  // cases for if the user is trying to join a room
  // FAIL CASE: the user tries to join a room that doesn't exist
  if (!rooms[roomReq]) {
    console.log(`${user} tried to join a room that doesn't exist`);
    return new Response(JSON.stringify({
      status: 500,
      message: `${user} tried to join a room that doesn't exist`,
    }), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "content-type": "application/json"
      }
    });
  }
  // the room that the user is trying to join exists
  else if (rooms[roomReq]) {
    const occupants = rooms[roomReq].length;
    // SUCCESS CASE: if the room can fit the user, add them to the room
    if (occupants < max) {
      rooms[roomReq].push(user);
      console.log(rooms[roomReq])
      console.log(`added ${user} to room ${roomReq}`)
      return new Response(JSON.stringify({
        status: 200,
        message: roomReq,
        occupants: rooms[roomReq]
      }), {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "content-type": "application/json"
        }
      });
    } 
    // FAIL CASE: the user is trying to join a room that is full
    else {
      console.log(`${user} tried to join a room that is full`);
      return new Response(JSON.stringify({
        status: 500,
        message: `${user} tried to join a room that is full`,
      }), {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "content-type": "application/json"
        }
      });
    };
  };
}

// JSON detection
function isJSON(str) {
  try {
    JSON.parse(str);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return false;
    }
  }
  return true;
}

// regular http server
Bun.serve({

  port: 5000,

  fetch(req, server) {
    const url = new URL(req.url);
    const roomReq = url.searchParams.get('roomReq');
    const name = url.searchParams.get('name');
    // sends a Response object containing text information about how the data was handled
    return handleNewUser(name, roomReq)
  },

  error (err) {
    return new Response(`error in http server: ${err}`)
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
        room: url.searchParams.get("room") || "unspecified room"
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
        type: "USER JOIN/EXIT",
        name: "SERVER",
        message: `${ws.data?.name} joined the room`,
        occupants: rooms[ws.data.room]
      };

      const joinMessage = JSON.stringify(messageObject);

      ws.publish(ws.data.room, joinMessage);
    },

    message(ws, message) {

      if (isJSON(message)) {
        console.log(`video request from ${ws.data.name}`)
        ws.publish(ws.data.room, message)
      } else {
        const messageObject = {
          name: ws.data?.name,
          message: message
        };
  
        const messageString = JSON.stringify(messageObject);
  
        ws.publish(ws.data.room, messageString);
      };      
    },

    close(ws, code, reason) {

      console.log(`connection closed in room ${ws.data?.room}: ${reason}`);

      // remove user from room
      rooms[ws.data.room] = rooms[ws.data.room].filter(el => el !== ws.data.name)

      const messageObject = {
        type: "USER JOIN/EXIT",
        name: "SERVER",
        message: `${ws.data?.name} left the room`,
        occupants: rooms[ws.data.room]
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