import s from '../styles/components/main.module.css'

import { pc } from '../App.jsx'

// sends an RTC offer to the ws server
async function createAndSendOffer(socket) {
  if (!socket) return;

  // creates the offer
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  console.log("created offer: ", offer);

  socket.send(JSON.stringify({
    type: "offer",
    sdp: pc.localDescription.sdp
  }))
};

export function Main({socket, localVideoRef, remoteVideoRef}) {
  return (
    <div className={s.main}>
      <div>
          <video
              style={{
                  width: 240,
                  height: 240,
                  margin: 5,
                  backgroundColor: "black",
              }}
              muted
              ref={localVideoRef}
              autoPlay
          ></video>
          <video
              id="remotevideo"
              style={{
                  width: 240,
                  height: 240,
                  margin: 5,
                  backgroundColor: "black",
              }}
              ref={remoteVideoRef}
              autoPlay
          ></video>
      </div>
      <button className={s.videoBtn} onClick={() => {
        createAndSendOffer(socket)
      }}>offer</button>
    </div>
  );
};