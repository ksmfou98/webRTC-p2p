import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const pc_config = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};
const SERVER_URL = "http://localhost:4000";
const socket = io(SERVER_URL);

const MeetPage = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection>();

  const getMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    pcRef.current = new RTCPeerConnection(pc_config);

    socket.emit("joinRoom", {
      room: "test",
    });

    getMedia();
  }, []);

  return (
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
  );
};

export default MeetPage;
