import s from "../styles/components/controls.module.css"

import { pc } from '../App.jsx'

async function createOffer(socket) {
  if (!socket) return;

  // creates the offer
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  // send the offer
  socket.send(JSON.stringify({
    type: "offer",
    sdp: pc.localDescription.sdp
  }))
};

export function Controls({socket}) {
  return (
    <div className={s.outline}>
      <button className={s.connectBtn} onClick={() => {
        createOffer(socket)
      }}>Connect</button>
    </div>
  )
}