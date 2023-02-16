import s from "./styles/App.module.css";
import { useState, useEffect } from 'react';

// components
import { Modal } from "./components/modal";
import { Chat } from './components/chat'
import { Main } from "./components/main";

// RTC
import { pc } from "./components/main"

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


  // when the roomID is updated, the client creates/joins a
  // room with a ws connection
  useEffect(() => {
    if (name && roomID) {
      const tempSocket = new WebSocket(`ws://localhost:8080/?name=${name}&room=${roomID}`)
      tempSocket.onmessage = ({ data }) => {
        console.log("message received ", data)
        data = JSON.parse(data)
        if (data.hasOwnProperty("type")) {
          establishRTC(data, tempSocket)
        } else {
          setList(list => [...list, data])
        }
      };
      setSocket(tempSocket)
    }
  }, [roomID])

  return (
    <div className={s.app}>
      <div className={s.backdrop}></div>
      <Modal setRoomID={setRoomID} setName={setName}></Modal>
      <Main socket={socket}></Main>
      <Chat list={list} socket={socket} roomID={roomID}></Chat>
    </div>
  );
}

export default App;
