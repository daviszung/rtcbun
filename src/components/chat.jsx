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

  console.log('in chat: ', list[0]?.message)

  return (
    <div className={style.chat}>
      <ul className={style.list}>
        {list.map((msg) => 
        <li className={style.message}>
          <div className={style.msgName}>{msg.name}</div>
          <div className={style.msgText}>{msg.message}</div>
        </li>)}
      </ul>
      <textarea id="msgInput" className={style.chatInput} onKeyDown ={(event) => {
        if (event.keyCode === 13 && !event.shiftKey) {
          event.preventDefault()
          sendInput(socket)
        }
      }}></textarea>
    </div>
  );
}