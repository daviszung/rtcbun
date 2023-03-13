import { pc, userStream } from '../App.jsx';

async function createOffer(socket) {
  if (!socket) return;

  // creates the offer
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  // send the offer
  socket.send(JSON.stringify({
    type: "offer",
    sdp: pc.localDescription.sdp
  }));
};

// enable or disable video
function toggleVideo(stream) {

  const videoTrack = stream.getTracks().find(track => track.kind === 'video');

  if (videoTrack.enabled) {
    videoTrack.enabled = false;
  } else {
    videoTrack.enabled = true;
  };
};

export function Controls({socket}) {
  return (
    <div className="outline">
      <button className="standardBtn" onClick={() => {
        createOffer(socket)
      }}>Connect</button>
      <button className="standardBtn" onClick={() => {
        toggleVideo(userStream)
      }}>Toggle Video</button>
    </div>
  );
};