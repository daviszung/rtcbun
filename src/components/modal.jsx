import s from "../styles/components/modal.module.css"

// takes an id and checks the DOM for an element with that id. If the
// element has a value, returns the value, for blank values, returns false
function checkInput(id) {
  const input = document.querySelector(`#${id}`)
  if (input.value.length > 0) {
    return input.value;
  } else {
    return false;
  }
};

// closes the modal
function closeModal() {
  const modal = document.querySelector("#myModal");
  const backdrop = document.querySelector(".backdrop");
  modal.style.display = "none";
  backdrop.style.display = "none";
};

export function Modal({setRoomID, setName, occupants, setOccupants}) {

  // only works if the user has input a name
  // creates a new room by getting a room number from the http server
  // puts the user into the new room
  async function createRoom(name) {
    let data = await fetch(`http://localhost:5000/?name=${name}`);
    console.log(data)
    data = await data.json();
    console.log(data)
    setName(name);
    setRoomID(data.message);
    setOccupants([data.occupants]);
  };

  // puts the user into a requested room
  async function joinRoom(name, roomToJoin) {
    
    let data = await fetch(`http://localhost:5000/?name=${name}&roomReq=${roomToJoin}`)
    console.log(data)
    data = await data.json();
    console.log({data})
    if (data.status !== 200) {
      alert(data.message)
    } 
    else {
      setName(name);
      setRoomID(roomToJoin);
      setOccupants([...data.occupants])
      closeModal();
    }
  };

  return (
    <div id="myModal" className={s.modal}>
      <div className={s.container}>
        <h2 className={s.heading}>Name:</h2>
        <input id="nameInput" className={s.inputField} maxLength="15" autoComplete="off"></input>
      </div>
      <div className={s.container}>
        <h3 className={s.heading}>Join Room:</h3>
        <input id="joinRoomInput" className={s.inputField} maxLength="4" type="number" autoComplete="off"></input>
      </div>
      <div className={s.optionsBtns}>
        <button id="createBtn" className={s.createBtn} onClick={() => {
          const name = checkInput('nameInput');
          if (name) {
            createRoom(name)
            closeModal()
          }
        }}>Create a room</button>
        <button id="joinBtn" className={s.joinBtn} onClick={() => {
          const name = checkInput('nameInput');
          const roomToJoin = checkInput('joinRoomInput');
          if (name && roomToJoin) {
            joinRoom(name, roomToJoin)
          }
        }}>Join a room</button>
      </div>
    </div>
  )
};