export function Main({localVideoRef, remoteVideoRef}) {
  return (
    <div className="main">
      <div className="videos">
        <video
            className="localVideo"
            ref={localVideoRef}
            autoPlay
            muted
        ></video>
        <video
            className="remoteVideo"
            ref={remoteVideoRef}
            autoPlay
        ></video>
      </div>
    </div>
  );
};