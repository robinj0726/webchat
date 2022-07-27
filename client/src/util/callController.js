'use strict';

import io from 'socket.io-client';
import callerState from "../store/callerState";

let configuration = {
  iceServers: [{
    // urls: 'stun:stun.l.google.com:19302'
    urls: "stun:openrelay.metered.ca:80"
  }]
};

let localStream;
let socket;
let peerConnection;
let room;

if(callerState.audio) {
  callerState.audio.subscribe(value =>{
    if(localStream) {
      localStream.getAudioTracks()[0].enabled = value;
    }
  });
}

if(callerState.video) {
  callerState.video.subscribe(value =>{
    if(localStream) {
      localStream.getVideoTracks()[0].enabled = value;
    }
  });
}

export async function NewCallController() {

  socket = io.connect();;

  socket.on(socketActions.created, (room)=>{
    console.log("room created");
  });

  socket.on(socketActions.join, (room)=>{
    console.log("attempting to join");
  });

  socket.on(socketActions.joined, (room)=>{
    console.log("someone joined the room");
  });

}

export function NewVideoCall(roomNo, callback) {
  room = roomNo;

  console.log("creating or joining room: " + room);
  socket.emit(socketActions.createOrJoin, room, callback);
}

export function StartWebRTC(isOfferer) {
  peerConnection = new RTCPeerConnection(configuration);
  // 'onicecandidate' notifies us whenever an ICE agent needs to deliver a
  // message to the other peer through the signaling server
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      sendMessage({'ice': event.candidate});
    }
  };

  // If user is offerer let the 'negotiationneeded' event create the offer
  if (isOfferer) {
    peerConnection.onnegotiationneeded = () => {
      peerConnection.createOffer().then(localDescCreated).catch(onError);
    }
  }

  // When a remote stream arrives display it in the #remoteVideo element
  peerConnection.ontrack = event => {
    const stream = event.streams[0];
    if (!remoteVideo.srcObject || remoteVideo.srcObject.id !== stream.id) {
      const remoteVideo = document.getElementById('remoteVideo');
      const localVideo = document.getElementById('localVideo');
      localVideo.classList.toggle("full-screen-video");
      localVideo.classList.toggle("secondary-video");
      remoteVideo.classList.toggle("full-screen-video");
      remoteVideo.classList.toggle("secondary-video");
      remoteVideo.srcObject = stream;
    }
  };

  navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  }).then(stream => {
    localStream = stream;
    // Display your local video in #localVideo element
    const localVideo = document.getElementById('localVideo')
    localVideo.srcObject = stream;
    localVideo.muted = true;
    // Add your stream to be sent to the conneting peer
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
  }, onError);

  socket.on('message', (message, client) => {
    console.log('recv: ' + message);
    if (message.sdp) {
      // This is called after receiving an offer or answer from another peer
      peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp), () => {
        // When receiving an offer lets answer it
        if (peerConnection.remoteDescription.type === 'offer') {
          peerConnection.createAnswer().then(localDescCreated).catch(onError);
        }
      }, onError);
    } else if (message.ice) {
      // Add the new ICE candidate to our connections remote description
      peerConnection.addIceCandidate(message.ice)
      .then(()=>{
        console.log('Added Ice Candidate: ' + message.ice)
      })
      .catch(err=>{
        console.log("Failure during addIceCandidate(): " + err.name)
      });
    }
  });
}

function localDescCreated(desc) {
  peerConnection.setLocalDescription(
    desc,
    () => sendMessage({'sdp': peerConnection.localDescription}),
    onError
  );
}

function onError(err) {
  console.log(err);
}
function onSuccess() {};

export function sendMessage(message) {
  console.log(socket.id)
  message.room = room;
  socket.emit(
    socketActions.message,
    message,
  );
}

export const socketActions = {
  connection: 'connection',
  disconnect: 'disconnect',
  createOrJoin: "create or join",
  created: "created",
  join: "join",
  joined: "joined",
  message: "message",
  data: "data",
};
