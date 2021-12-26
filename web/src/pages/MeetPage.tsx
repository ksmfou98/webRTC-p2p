import React, { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const { roomId } = useParams();
  const navigate = useNavigate();

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

  const createOffer = async () => {
    if (!pcRef.current) return;
    try {
      const sdp = await pcRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pcRef.current.setLocalDescription(new RTCSessionDescription(sdp));
      socket.emit("offer", sdp);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    pcRef.current = new RTCPeerConnection(pc_config);

    socket.emit("joinRoom", {
      roomId,
    });

    socket.on("roomFull", ({ message }: { message: string }) => {
      alert(message);
      navigate("/");
    });

    socket.on("allUsers", (users: Array<{ id: string }>) => {
      if (users.length > 0) createOffer();
      console.log(users);
    });

    socket.on("getOffer", (sdp: RTCSessionDescription) => {
      console.log(sdp);
    });

    socket.on("userExit", ({ id }: { id: string }) => {
      console.log(`${id} 님이 나가셨습니다.`);
    });

    getMedia();

    return () => {
      socket.emit("disconnect");
      socket.off();
    };
  }, [roomId, navigate]);

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
