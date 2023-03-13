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

// enable or disable video or audio
function toggleMedia(stream, mediaType) {
  console.log(mediaType)
  const mediaTrack = stream.getTracks().find(track => track.kind === mediaType);

  if (mediaTrack.enabled) {
    mediaTrack.enabled = false;
  } else {
    mediaTrack.enabled = true;
  };
  console.log(mediaTrack)
};

export function Controls({socket}) {
  return (
    <div className="outline">
      <button className="standardBtn" onClick={() => {
        createOffer(socket)
      }}>Connect</button>
      <button className="standardBtn" onClick={() => {
        toggleMedia(userStream, "audio")
      }}>Mute Self</button>
      <button className="standardBtn" onClick={() => {
        toggleMedia(userStream, "video")
      }}>Toggle Video</button>
    </div>
  );
};