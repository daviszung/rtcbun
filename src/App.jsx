import s from "./styles/App.module.css";
import { useState, useEffect } from 'react';

// components
import { Modal } from "./components/modal";
import { Chat } from './components/chat'
import { Main } from "./components/main";

// RTC
// STUN server configuration
const servers = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    },
  ],
  iceCandidatePoolSize: 10,
};

// RTC Peer Connection
const pc = new RTCPeerConnection(servers);

pc.onicecandidate = event => {
  if (event.candidate) {
    console.log('ICE candidate:', event.candidate);
    // Send the candidate to the remote peer via signaling server
  }
};


function establishRTC(data, socket) {
  if (data.type === "offer") {
    pc.setRemoteDescription(new RTCSessionDescription(data));
    pc.createAnswer().then(answer => {
      pc.setLocalDescription(answer);
      console.log(answer)
      socket.send(JSON.stringify(answer));
    })
  } else if (data.type === "answer") {
    pc.setRemoteDescription(new RTCSessionDescription(data));
    console.log({pc})
  }
}


function App() {
  const [name, setName] = useState(null);
  const [socket, setSocket] = useState(null);
  const [list, setList] = useState([]);
  const [roomID, setRoomID] = useState(null);
  const [pc, setPC] = useState(null);
  const [occupants, setOccupants] = useState([]);


  // when the roomID is updated, the client creates/joins a
  // room with a ws connection
  useEffect(() => {
    if (name && roomID) {
      const tempSocket = new WebSocket(`ws://localhost:8080/?name=${name}&room=${roomID}`)
      tempSocket.onmessage = ({ data }) => {
        console.log("message received ", data)
        data = JSON.parse(data)
        if (data?.type === "USER JOIN/EXIT") {
          setOccupants([...data.occupants])
          setList(list => [...list, data])
        } 
        else if (data?.type === "RTC") {
          establishRTC(data, tempSocket)
        }
        else {
          setList(list => [...list, data])
        }
      };
      setSocket(tempSocket)
    }
  }, [roomID])

  return (
    <div className={s.app}>
      <div className={s.backdrop}></div>
      <Modal setRoomID={setRoomID} setName={setName} occupants={occupants} setOccupants={setOccupants}></Modal>
      <Main socket={socket}></Main>
      <Chat list={list} socket={socket} roomID={roomID} occupants={occupants}></Chat>
    </div>
  );
}

export default App;
