import s from "./styles/App.module.css";
import { useState, useEffect } from 'react';

// components
import { Modal } from "./components/modal";
import { Chat } from './components/Chat.jsx'

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
        data = JSON.parse(data)
        setList(list => [...list, data])
      };
      setSocket(tempSocket)
    }
  }, [roomID])

  return (
    <div className={s.app} role="main">
      <Modal setRoomID={setRoomID} setName={setName}></Modal>
      <div className={s.left}>
      </div>
      <Chat list={list} socket={socket} roomID={roomID}></Chat>
    </div>
  );
}

export default App;
