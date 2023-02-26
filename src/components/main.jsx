import s from '../styles/components/main.module.css'

export function Main({localVideoRef, remoteVideoRef}) {
  return (
    <div className={s.main}>
      <div className={s.videos}>
        <video
            className={s.localVideo}
            ref={localVideoRef}
            autoPlay
            muted
        ></video>
        <video
            className={s.remoteVideo}
            ref={remoteVideoRef}
            autoPlay
        ></video>
      </div>
    </div>
  );
};