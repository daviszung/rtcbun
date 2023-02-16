import s from '../styles/components/main.module.css'

// RTC
const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
    },
  ],
  iceCandidatePoolSize: 10,
};
export const pc = new RTCPeerConnection(servers);


// gets information about the client's video and audio devices
async function getMediaTracks() {
  const constraints = {
    audio: true,
    video: true,
  };

  const ms = await window.navigator.mediaDevices.getUserMedia(constraints)
  
  const tracks = ms.getTracks();
  console.log({tracks})

  return tracks;
};

// add tracks to RTC Object
const tracks = await getMediaTracks();
console.log({tracks});
tracks.forEach((track) => {
  pc.addTrack(track)
});

// sends an RTC offer to the ws server
async function createAndSendOffer(socket) {
  if (!socket) return;

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const stringOffer = JSON.stringify(offer);

  console.log({offer}, stringOffer)

  socket.send(stringOffer)
};

export function Main({socket}) {
  return (
    <div className={s.main}>
      <button className={s.videoBtn} onClick={() => {
        createAndSendOffer(socket)
      }}>video start</button>
    </div>
  );
};