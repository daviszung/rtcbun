import style from '../styles/components/modal.module.css'

function closeModal() {
  const modal = document.querySelector("#myModal");
  modal.style.display = 'none'
}

export function Modal() {
  return (
    <div id="myModal" class={style.modal}>
      <div class={style.modalContent}>
        <h1>Name:</h1>
        <input></input>
        <div>
          <button></button>
          <button></button>
        </div>
      </div>
    </div>
  )
}