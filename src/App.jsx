import style from "./styles/App.module.css";
import { useState } from 'react';

import { Chat } from './components/Chat.jsx'

const socket = new WebSocket('ws://localhost:8080');

function App() {

  const [list, setList] = useState([]);

  socket.onmessage = ({ data }) => {
    data = JSON.parse(data)
    setList([...list, data])
  };

  return (
    <div className={style.app} role="main">
      <div className={style.left}></div>
      <Chat list={list} socket={socket}></Chat>
    </div>
  );
}

export default App;
