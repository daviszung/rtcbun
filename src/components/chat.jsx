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
    <div className="chat">
      <ul className="roomInfo">
        <li>Room: {roomID}</li>
        {occupants && occupants.map((name, index) => 
        <li key={index}>{name}</li>
        )}
      </ul>
      <ul className="list">
        {list.map((msg, index) => 
        <li key={index} className="message">
          <div className="msgName">{msg.name}</div>
          <div className="msgText">{msg.message}</div>
        </li>)}
      </ul>
      <textarea id="msgInput" className="chatInput" onKeyDown ={(event) => {
        if (event.key === 'Enter' && !event.shiftKey && socket) {
          event.preventDefault();
          sendInput(socket);
        }
      }}></textarea>
    </div>
  );
}