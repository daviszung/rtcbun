import { file } from 'bun'
import path from 'path';

// rooms contain up to two users
const rooms = {};
const wsRooms = {};
let numOfRooms = 0;
const max = 2;

// add someone to a room or create a room
// takes a user and requested room as input, roomReq optional
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
  };
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
    // FAIL CASE: the user is trying to join with the same name as someone else in the room
    for (let i = 0; i < occupants; i++) {
      if (user === rooms[roomReq][i]) {
        return new Response(JSON.stringify({
          status: 500,
          message: `${user} tried to join a room without a unique name`,
        }), {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "content-type": "application/json"
          }
        });
      }
    }
    // SUCCESS CASE: if the room can fit the user, add them to the room
    if (occupants < max) {
      rooms[roomReq].push(user);
      console.log(`added (${user}) to room (${roomReq})`)
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
// helps users create or join rooms
Bun.serve({

  port: 5000,
  certFile: "../../../etc/letsencrypt/live/www.rtcbun.site/fullchain.pem",
  keyFile: "../../../etc/letsencrypt/live/www.rtcbun.site/privkey.pem",

  fetch(req, server) {
    console.log({req})

    const url = new URL(req.url);
    console.log(url.port, url.pathname)
    const roomReq = url.searchParams.get('roomReq');
    const name = url.searchParams.get('name');

    // initial load for html, css, and js
    if (!name && !roomReq) {
      if (url.pathname === "/") {
        // return new Response(file(path.join(__dirname, "../../dist")))
        return new Response(file(path.join(__dirname, "../../public/index.html")), {
          headers: {
            "content-type": "text/html"
          }
        });
      }
      else if (url.pathname === "/dist/bundle.js") {
        return new Response(file(path.join(__dirname, "../../dist/bundle.js")));
      }
      else if (url.pathname === "/dist/bundle.css") {
        return new Response(file(path.join(__dirname, "../../dist/bundle.css")), {
          headers: {
            "content-type": "text/css"
          }
        });
      }
      else if (url.pathname === "/assets/favicon-32x32.png") {
        return new Response(file(path.join(__dirname, "../../assets/favicon.ico")));
      }
      
    } else {
      // sends a Response object containing text information about how the data was handled
      return handleNewUser(name, roomReq);
    }
  },

  error (err) {
    return new Response(`error in http server: ${err}`);
  }
});


// websocket server
Bun.serve({

  port: 8080,

  // upgrade from http to ws
  fetch(req, server) {
    console.log({req})
    const url = new URL(req.url);
    if (server.upgrade(req, {
      data: {
        name: url.searchParams.get("name") || "unnamed",
        room: url.searchParams.get("room") || "unspecified room"
      }
    })) {
      return;
    }
    return new Response("Expected a websocket connection", { status: 400 });
  },

  // websocket logic
  websocket: {

    open(ws) {
      // put new users into their room
      if (wsRooms[ws.data.room]) {
        wsRooms[ws.data.room].push(ws);
      } else {
        wsRooms[ws.data.room] = [ws];
      };

      console.log(`New ws connection, user (${ws.data?.name}) subscribed to room (${ws.data?.room})`);

      // subscribe to the room
      ws.subscribe(ws.data.room);

      // notify the room that the user has joined
      ws.publish(ws.data.room, JSON.stringify({
        type: "USER JOIN/EXIT",
        name: "SERVER",
        message: `${ws.data?.name} joined the room`,
        occupants: rooms[ws.data.room]
      }));
    },

    message(ws, message) {
      // receiving offer, answer, or candidate
      if (isJSON(message)) {
        message = JSON.parse(message)
        if (message.type === "offer") {
          wsRooms[ws.data.room].forEach((socket) => {
            if (socket.data.name !== ws.data.name) {
              socket.send(JSON.stringify({
                type: "server-offer",
                sdp: message.sdp
              }))
            };
          })
        } else if (message.type === "answer") {
          wsRooms[ws.data.room].forEach((socket) => {
            if (socket.data.name !== ws.data.name) {
              socket.send(JSON.stringify({
                type: "server-answer",
                sdp: message.sdp
              }))
            }
          })
        } else if (message.type === "candidate") {
          wsRooms[ws.data.room].forEach((socket) => {
            if (socket.data.name !== ws.data.name) {
              socket.send(JSON.stringify({
                type: "server-candidate",
                candidate: message.data
              }))
            }
          })
        }
      }
      // send normal chat messages
      else {
        ws.publish(ws.data.room, JSON.stringify({
          name: ws.data?.name,
          message: message
        }));
      };      
    },

    close(ws) {

      console.log(`connection closed in room ${ws.data?.room}`);

      // remove user from room and wsRoom
      rooms[ws.data.room] = rooms[ws.data.room].filter(el => el !== ws.data.name);
      wsRooms[ws.data.room] = wsRooms[ws.data.room].filter(el => el.data.name !== ws.data.name);

      // notify the room that the user has left
      ws.publish(ws.data.room, JSON.stringify({
        type: "USER JOIN/EXIT",
        name: "SERVER",
        message: `${ws.data?.name} left the room`,
        occupants: rooms[ws.data.room]
      }));
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