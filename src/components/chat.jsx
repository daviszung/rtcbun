import style from '../styles/components/chat.module.css'

function sendInput(socket) {
  const input = document.querySelector('#msgInput');
  if(input.value.length > 0) {
    socket.send(input.value)
  }
  input.value = '';
  return;
}

export function Chat({list, socket}) {

  return (
    <div className={style.chat}>
      <ul className={style.list}>
        {list.map((msg) => <li>{msg}</li>)}
      </ul>
      <textarea id="msgInput" className={style.chatInput} onKeyDown ={(event) => {
        if (event.keyCode === 13) {sendInput(socket)}
      }}></textarea>
    </div>
  );
}