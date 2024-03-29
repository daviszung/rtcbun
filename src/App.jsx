import { useState, useEffect, useRef } from 'react';

// components
import { Modal } from "./components/modal";
import { Chat } from './components/chat'
import { Main } from "./components/main";
import { Controls } from "./components/controls";

// RTC
// STUN server configuration
const servers = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    },
  ],
  iceCandidatePoolSize: 8,
};

// RTC Peer Connection
export const pc = new RTCPeerConnection(servers);

// cam and mic
export let userStream = undefined;

// when an ice candidate is found it is sent to the server
function handleIceCandidate(event, socket) {
  if (event.candidate) {
    socket.send(JSON.stringify({
      type: "candidate",
      data: event.candidate
    }))
  }
};

async function createAnswer (sdp, socket) {

  // set the remote description using the offer from the peer client
  await pc.setRemoteDescription(new RTCSessionDescription({
    type: "offer",
    sdp: sdp
  }))

  // create answer
  const answer = await pc.createAnswer({
    offerToReceiveVideo: true,
    offerToReceiveAudio: true,
  });

  // set the local description with the client's answer
  await pc.setLocalDescription(new RTCSessionDescription(answer));

  // send answer to server
  socket.send(JSON.stringify(answer));
};

async function handleAnswer (sdp) {
  // sets the remote description with the answer from the peer client
  await pc.setRemoteDescription(new RTCSessionDescription({
    type: "answer",
    sdp: sdp
  }));
};

function App({envi}) {
  const [name, setName] = useState(null);
  const [socket, setSocket] = useState(null);
  const [list, setList] = useState([]);
  const [roomID, setRoomID] = useState(null);
  const [occupants, setOccupants] = useState([]);
  const [chat, setChat] = useState("none");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // this code only runs once, if it ran every time there was a re-render
  // the video would flicker off/on every time a message was sent
  // the navigator.mediaDevices API is not available outside of HTTPS
  useEffect(() => {
    window.navigator.mediaDevices?.getUserMedia({
      video: true,
      audio: true,
    })
    .then(stream => {
      
      userStream = stream;

      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
  
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
  
      pc.ontrack = event => {
        if (remoteVideoRef.current)
            remoteVideoRef.current.srcObject = event.streams[0];
      };
    });
  }, []);
  

  // when the roomID is updated, the client creates/joins a
  // room with a ws connection
  useEffect(() => {
    if (name && roomID) {
      // create the websocket connection
      // envi is the environment, if in development mode, it will be rtcbundev
      const websocket = envi === 'rtcbun'
      ? new WebSocket(`wss://rtcbun.site:8080/?name=${name}&room=${roomID}`)
      : new WebSocket(`ws://localhost:8080/?name=${name}&room=${roomID}`);

      // determine how data from the server is handled
      websocket.onmessage = ({ data }) => {

        data = JSON.parse(data);

        if (data?.type === "USER JOIN/EXIT") {
          setOccupants([...data.occupants]);
          setList(list => [...list, data]);
        } 
        else if (data?.type === "server-offer") {
          createAnswer(data.sdp, websocket);
        }
        else if (data?.type === "server-answer") {
          handleAnswer(data.sdp);
        }
        else if (data?.type === "server-candidate") {
          pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
        else {
          setList(list => [...list, data]);
        }
      };

      // icecandidate event
      pc.onicecandidate = e => {
        handleIceCandidate(e, websocket);
      };

      setSocket(websocket);
    };
  }, [roomID]);

  return (
    <div className="app">
      <div id="backdrop" className="backdrop"></div>
      <Modal envi={envi} setRoomID={setRoomID} setName={setName} setOccupants={setOccupants}/>
      <Chat list={list} socket={socket} roomID={roomID} occupants={occupants} chat={chat}/>
      <div className="appContainer">
        <Main localVideoRef={localVideoRef} remoteVideoRef={remoteVideoRef}/>
        <Controls socket={socket} chat={chat} setChat={setChat}/>
      </div>
    </div>
  );
};

export default App;
