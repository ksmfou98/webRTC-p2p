import React, { useCallback, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

const pc_config = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};
const SERVER_URL = "https://ancient-escarpment-77943.herokuapp.com/";
const socket = io(SERVER_URL);

const MeetPage = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection>();
  const { roomId } = useParams();
  const navigate = useNavigate();

  const getMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      if (!pcRef.current) return;

      stream.getTracks().forEach((track) => {
        pcRef.current?.addTrack(track, stream);
      });

      pcRef.current.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("candidate", e.candidate);
        }
      };

      pcRef.current.oniceconnectionstatechange = (e) => {
        console.log("oniceconnectionstatechange", e);
      };

      pcRef.current.ontrack = (e) => {
        console.log("add remote track success");
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = e.streams[0];
        }
      };

      socket.emit("joinRoom", {
        roomId,
      });
    } catch (e) {
      console.error(e);
    }
  }, [roomId]);

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

  const createAnswer = async (sdp: RTCSessionDescription) => {
    if (!pcRef.current) return;
    try {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      const mySdp = await pcRef.current.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pcRef.current.setLocalDescription(new RTCSessionDescription(mySdp));
      socket.emit("answer", mySdp);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    pcRef.current = new RTCPeerConnection(pc_config);

    socket.on("roomFull", ({ message }: { message: string }) => {
      alert(message);
      navigate("/");
    });

    socket.on("allUsers", (users: Array<{ id: string }>) => {
      if (users.length > 0) createOffer();
      console.log(users);
    });

    socket.on("getOffer", (sdp: RTCSessionDescription) => {
      console.log("getOffer (들어온 사람)", sdp);
      createAnswer(sdp);
    });

    socket.on("getAnswer", (sdp: RTCSessionDescription) => {
      console.log("getAnswer (기존에 있던 사람)", sdp);
      if (!pcRef.current) return;
      pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socket.on("getCandidate", async (candidate: RTCIceCandidateInit) => {
      if (!pcRef.current) return;
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      console.log("candidate add success");
    });

    socket.on("userExit", ({ id }: { id: string }) => {
      console.log(`${id} 님이 나가셨습니다.`);
    });

    getMedia();

    return () => {
      socket.emit("disconnect");
      socket.off();
      pcRef.current?.close();
    };
  }, [roomId, navigate, getMedia]);

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
