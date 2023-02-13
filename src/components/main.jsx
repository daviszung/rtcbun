import s from '../styles/components/main.module.css'


// gets information about the client's video and audio devices
// const constraints = {
//   audio: true,
//   video: true,
// };

// window.navigator.mediaDevices.getUserMedia(constraints)
//   .then((stream) => {
//     console.log(stream.getAudioTracks())
//     console.log(stream.getVideoTracks())
//   });

async function createAndSendOffer() {
  const sender = new RTCPeerConnection();

  const result = await sender.createOffer();

  console.log({result})
};

export function Main() {
  return (
    <div className={s.main}>
      <button className={s.videoBtn} onClick={createAndSendOffer}>bideo start</button>
    </div>
  );
};