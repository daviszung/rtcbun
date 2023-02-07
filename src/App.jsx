import style from "./styles/App.module.css";
import { useState } from 'react';


const socket = new WebSocket('ws://localhost:8080');

// ws://localhost:8080

function App() {

  const [list, setList] = useState([]);
  console.log({list})

  socket.onmessage = ({ data }) => {
    console.log(`Message from server ${data}`)
    setList([...list, data])
  };

  return (
    <div className={style.app} role="main">
      <ul>
        {list.map((msg) => <li>{msg}</li>)}
      </ul>
      <input id="msgInput"></input>
      <button onClick={() => {
        const message = document.querySelector('#msgInput').value;
        socket.send(message)
      }}>Send</button>
    </div>
  );
}

export default App;
