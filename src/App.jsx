import s from "./styles/App.module.css";
import { useState, useEffect, useRef } from 'react';

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
export const pc = new RTCPeerConnection(servers);

function handleIceCandidate(event, socket) {
  if (event.candidate) {
    // Send the candidate to the remote peer via signaling server
    socket.send(JSON.stringify({
      type: "candidate",
      data: event.candidate
    }))
  }
};

async function createAnswer (sdp, socket) {

  await pc.setRemoteDescription(new RTCSessionDescription({
    type: "offer",
    sdp: sdp
  }))

  // create answer
  const answer = await pc.createAnswer({
    offerToReceiveVideo: true,
    offerToReceiveAudio: true,
  });

  await pc.setLocalDescription(new RTCSessionDescription(answer));

  // send answer to server
  socket.send(JSON.stringify(answer));
};

async function handleAnswer (sdp) {
  await pc.setRemoteDescription(new RTCSessionDescription({
    type: "answer",
    sdp: sdp
  }));
};

function App() {
  const [name, setName] = useState(null);
  const [socket, setSocket] = useState(null);
  const [list, setList] = useState([]);
  const [roomID, setRoomID] = useState(null);
  const [occupants, setOccupants] = useState([]);

  let localVideoRef = useRef(null);
  let remoteVideoRef = useRef(null);

  // this code only runs once, if it ran every time there was a re-render
  // then the video would flicker every time a message was sent
  useEffect(() => {
    window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })
    .then(stream => {
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
  
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
  
      pc.ontrack = ev => {
        if (remoteVideoRef.current)
            remoteVideoRef.current.srcObject = ev.streams[0];
      };
    });
  }, [])
  

  // when the roomID is updated, the client creates/joins a
  // room with a ws connection
  useEffect(() => {
    if (name && roomID) {
      const websocket = new WebSocket(`ws://localhost:8080/?name=${name}&room=${roomID}`)
      websocket.onmessage = ({ data }) => {
        data = JSON.parse(data)
        if (data?.type === "USER JOIN/EXIT") {
          setOccupants([...data.occupants])
          setList(list => [...list, data])
        } 
        else if (data?.type === "server-offer") {
          createAnswer(data.sdp, websocket)
        }
        else if (data?.type === "server-answer") {
          handleAnswer(data.sdp)
        }
        else if (data?.type === "server-candidate") {
          pc.addIceCandidate(new RTCIceCandidate(data.candidate)).then(() => {
          })
        }
        else {
          setList(list => [...list, data])
        }
      };
      // icecandidate
      pc.onicecandidate = e => {
        handleIceCandidate(e, websocket)
      };
      setSocket(websocket)
    }
  }, [roomID])

  return (
    <div className={s.app}>
      <div className={s.backdrop}></div>
      <Modal setRoomID={setRoomID} setName={setName} occupants={occupants} setOccupants={setOccupants}></Modal>
      <Main socket={socket} localVideoRef={localVideoRef} remoteVideoRef={remoteVideoRef}></Main>
      <Chat list={list} socket={socket} roomID={roomID} occupants={occupants}></Chat>
    </div>
  );
}

export default App;
