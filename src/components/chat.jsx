import s from '../styles/components/chat.module.css'

// sends a message from the chatbox to the ws server
function sendInput(socket) {
  const input = document.querySelector('#msgInput');
  if(input.value.length > 0) {
    socket.send(input.value);
  }
  input.value = '';
  return;
};


export function Chat({list, socket, roomID, occupants}) {

  return (
    <div className={s.chat}>
      <ul className={s.roomIDContainer}>
        <li>Room: {roomID}</li>
        {occupants && occupants.map((name, index) => 
        <li key={index}>{name}</li>
        )}
      </ul>
      <ul className={s.list}>
        {list.map((msg, index) => 
        <li key={index} className={s.message}>
          <div className={s.msgName}>{msg.name}</div>
          <div className={s.msgText}>{msg.message}</div>
        </li>)}
      </ul>
      <textarea id="msgInput" className={s.chatInput} onKeyDown ={(event) => {
        if (event.key === 'Enter' && !event.shiftKey && socket) {
          event.preventDefault();
          sendInput(socket);
        }
      }}></textarea>
    </div>
  );
}