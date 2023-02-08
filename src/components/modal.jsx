import style from '../styles/components/modal.module.css'

function closeModal() {
  const modal = document.querySelector("#myModal");
  modal.style.display = 'none'
}

export function Modal() {
  return (
    <div id="myModal" class={style.modal}>
      <div className={style.nameContainer}>
        <h1 className={style.nameText}>Name:</h1>
        <input className={style.inputName}></input>
      </div>
      <div className={style.optionsBtns}>
        <button className={style.createBtn}>Create a room</button>
        <button className={style.joinBtn}>Join a room</button>
      </div>
    </div>
  )
}