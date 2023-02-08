import style from "./styles/App.module.css";
import { useState, useEffect } from 'react';

import { Modal } from "./components/modal";
import { Chat } from './components/Chat.jsx'

function App() {
  const [name, setName] = useState(null);
  const [socket, setSocket] = useState(null);
  const [list, setList] = useState([]);
  const [roomID, setRoomID] = useState(null);

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
    <div className={style.app} role="main">
      <Modal setRoomID={setRoomID} setName={setName}></Modal>
      <div className={style.left}>
      </div>
      <Chat list={list} socket={socket} roomID={roomID}></Chat>
    </div>
  );
}

export default App;
