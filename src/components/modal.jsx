import style from "../styles/components/modal.module.css"

function checkNameInput() {
  const input = document.querySelector("#nameInput")
  return input.value.length > 0;
}


function closeModal() {
  const modal = document.querySelector("#myModal");
  modal.style.display = "none"
}

async function createRoom() {
  // send req to http server to get a room number
}

function joinRoom() {

}

export function Modal() {

  

  return (
    <div id="myModal" className={style.modal}>
      <div className={style.nameContainer}>
        <h1 className={style.nameText}>Name:</h1>
        <input id="nameInput" className={style.inputName} maxLength="15"></input>
      </div>
      <div className={style.optionsBtns}>
        <button id="createBtn" className={style.createBtn} onClick={() => {
          if (checkNameInput()) {
            createRoom()
          }
        }}>Create a room</button>
        <button id="joinBtn" className={style.joinBtn} onClick={() => {
          if (checkNameInput()) {
            
          }
        }}>Join a room</button>
      </div>
    </div>
  )
}