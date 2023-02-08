import style from '../styles/components/chat.module.css'

function sendInput(socket) {
  const input = document.querySelector('#msgInput');
  if(input.value.length > 0) {
    socket.send(input.value)
  }
  input.value = '';
  return;
}

export function Chat({list, socket, roomID}) {

  return (
    <div className={style.chat}>
      <div className={style.roomIDContainer}>
        <p>Room: {roomID}</p>
      </div>
      <ul className={style.list}>
        {list.map((msg, index) => 
        <li key={index} className={style.message}>
          <div className={style.msgName}>{msg.name}</div>
          <div className={style.msgText}>{msg.message}</div>
        </li>)}
      </ul>
      <textarea id="msgInput" className={style.chatInput} onKeyDown ={(event) => {
        if (event.key === 'Enter' && !event.shiftKey && socket) {
          event.preventDefault()
          sendInput(socket)
        }
      }}></textarea>
    </div>
  );
}