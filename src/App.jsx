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
export const pc = new RTCPeerConnection(servers);

// gets information about the client's video and audio devices
async function getMediaTracks() {
  const constraints = {
    audio: true,
    video: true,
  };

  const ms = await window.navigator.mediaDevices.getUserMedia(constraints)
  
  const tracks = ms.getTracks();

  return tracks;
};

// add tracks to RTC Object
const tracks = await getMediaTracks();
tracks.forEach((track) => {
  pc.addTrack(track)
});

function handleIceCandidate(event, socket) {
  if (event.candidate) {
    console.log("new ice candidate: ", event.candidate)
    // Send the candidate to the remote peer via signaling server
    socket.send(JSON.stringify({
      type: "candidate",
      data: event.candidate
    }))
  }
}

pc.oniceconnectionstatechange = (e) => {
  console.log("iceConnectionStateChange", e)
}

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

  console.log(answer.sdp)

  await pc.setLocalDescription(new RTCSessionDescription(answer));

  // send answer to server
  socket.send(JSON.stringify(answer));
};

async function handleAnswer (sdp) {
  await pc.setRemoteDescription(new RTCSessionDescription({
    type: "answer",
    sdp: sdp
  }));
  console.log({pc})
  let localDesc = pc.localDescription;
  let lines = localDesc.sdp.split('\n');
  let candidates = [];
  for (let line of lines) {
    if (line.startsWith('a=candidate:')) {
      candidates.push(line);
    }
  }
  console.log('Local ICE candidates:', candidates);

  let remoteDesc = pc.remoteDescription;
  let linesx = remoteDesc.sdp.split('\n');
  let candidatesx = [];
  for (let line of linesx) {
    if (line.startsWith('a=candidate:')) {
      candidatesx.push(line);
    }
  }
  console.log('Remote ICE candidates:', candidatesx);

};

function App() {
  const [name, setName] = useState(null);
  const [socket, setSocket] = useState(null);
  const [list, setList] = useState([]);
  const [roomID, setRoomID] = useState(null);
  const [occupants, setOccupants] = useState([]);



  // when the roomID is updated, the client creates/joins a
  // room with a ws connection
  useEffect(() => {
    if (name && roomID) {
      const websocket = new WebSocket(`ws://localhost:8080/?name=${name}&room=${roomID}`)
      websocket.onmessage = ({ data }) => {
        console.log("message received ", data)
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
            console.log('new candidate added')
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
      <Main socket={socket}></Main>
      <Chat list={list} socket={socket} roomID={roomID} occupants={occupants}></Chat>
    </div>
  );
}

export default App;
