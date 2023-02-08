import style from "../styles/components/modal.module.css"

function checkInput(id) {
  const input = document.querySelector(`#${id}`)
  if (input.value.length > 0) {
    return input.value;
  } else {
    return false;
  }
};

function closeModal() {
  const modal = document.querySelector("#myModal");
  modal.style.display = "none"
};

export function Modal({setRoomID, setName}) {

  async function createRoom(name) {
    // send req to http server to get a room number
    let data = await fetch(`http://localhost:5000/?name=${name}`);
    data = await data.text()
    console.log(data)
    setName(name)
    setRoomID(data)
  };

  function joinRoom(name, roomToJoin) {
    setName(name)
    setRoomID(roomToJoin)
  };

  return (
    <div id="myModal" className={style.modal}>
      <div className={style.nameContainer}>
        <h1 className={style.nameText}>Name:</h1>
        <input id="nameInput" className={style.inputName} maxLength="15"></input>
      </div>
      <div className={style.optionsBtns}>
        <button id="createBtn" className={style.createBtn} onClick={() => {
          const name = checkInput('nameInput');
          if (name) {
            createRoom(name)
            closeModal()
          }
        }}>Create a room</button>
        <button id="joinBtn" className={style.joinBtn} onClick={() => {
          const name = checkInput('nameInput');
          const roomToJoin = checkInput('joinRoomInput');
          if (name && roomToJoin) {
            joinRoom(name, roomToJoin)
            closeModal()
          }
        }}>Join a room</button>
      </div>
    </div>
  )
};