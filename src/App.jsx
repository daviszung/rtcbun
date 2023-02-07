import style from "./styles/App.module.css";
import { useState } from 'react';


const socket = new WebSocket('ws://localhost:8080');

// import { Chat } from './components/chat'


function App() {

  const [list, setList] = useState([])

  socket.onmessage = ({ data }) => {
    console.log(`Message from server ${data}`)
    setList([...list, data])
  };

  return (
    <div className={style.app} role="main">
      <div>
        Hello World
      </div>
      <button onClick={() => {
        const message = document.querySelector('#msgInput').value;
        socket.send(message)
      }}>Send</button>
    </div>
  );
}

export default App;
