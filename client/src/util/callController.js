'use strict';

import io from 'socket.io-client';
import callerState from "../store/callerState";

const configuration = {
  iceServers: [{
    // urls: 'stun:stun.l.google.com:19302'
    urls: "stun:openrelay.metered.ca:80"
  }]
};

const socket = io({ autoConnect: false })
const peers = {}

let localStream;
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

export function NewCallController() {
  socket.open();
  
  // when a user joins the server
  socket.on('user:joined', id => {
    console.log(`user ${id} joined`);
  });

  // when a user leaves
  socket.on('user:leave', id => {
    console.log(`user ${id} left`);
  });
  
  socket.on('user:rtc:ready', id => {
    console.log(`user ${id} rtc is ready`);
    socket.emit('user:rtc:start', id);
  });

  socket.on('user:rtc:start', startRtcConnection);

  socket.on('user:rtc:stop', stopRtcConnection);

  // when new user sent an answer 
  socket.on('user:rtc:answer', onRtcAnswer)
  
  // when a user gets an offer
  socket.on('user:rtc:offer', onRtcOffer)
 
  // when a candidate arrives
  socket.on('user:rtc:candidate', onRtcIceCandidate)
}

const onRtcOffer = async ({ id, offer }) => {

  console.log(`got offer from ${id}`, offer)

  if (!offer) return

  const pc = new RTCPeerConnection(configuration)

  addLocalStream(pc)

  pc.ontrack = addRemoteStream;
  pc.onicecandidate = sendIceCandidate(id)
  
  peers[id] = pc 

  const desc = new RTCSessionDescription(offer)

  pc.setRemoteDescription(desc)

  const answer = await pc.createAnswer()

  await pc.setLocalDescription(answer)

  socket.emit('user:rtc:answer', { id, answer })
}

const onRtcAnswer = async ({ id, answer }) => {

  console.log(`got answer from ${id}`, answer)

  const pc = peers[id]

  if (!pc) return 

  if (!answer) return

  const desc = new RTCSessionDescription(answer)

  await pc.setRemoteDescription(desc)
}

const onRtcIceCandidate = async ({ id, candidate }) => {

  console.log(`got ice candidate from ${id}`, candidate)

  if (!candidate) return

  const pc = peers[id]

  if (!pc) return

  await pc.addIceCandidate(candidate)

}

const startRtcConnection = async id => {

  const pc = new RTCPeerConnection(configuration);

  // add peerconnection to peerlist
  peers[id] = pc;

  addLocalStream(pc);

  pc.ontrack = addRemoteStream;
  pc.onicecandidate = sendIceCandidate(id);
  pc.onnegotiationneeded = async () =>  {
    // create a new offer
    const offer = await pc.createOffer();

    // set offer as local descrioption
    await pc.setLocalDescription(offer);

    // send offer out
    socket.emit('user:rtc:offer', { id, offer })

    // log
    console.log(`init new rtc peer connection for client ${id}`, offer)
  
  };

};

const stopRtcConnection = id => {

  const pc = peers[id]

  if (!pc) return

  pc.close()

  delete peers[id]

  console.log(`removed rtc peer connection ${id}`)
} 

const sendIceCandidate = id => ({ candidate }) => {
  if (candidate) {
    socket.emit('user:rtc:candidate', { id, candidate });
  }
}

const addLocalStream = pc => {
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream))
} 

const addRemoteStream = evt => {
  const stream = evt.streams[0];
  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');
  if (!remoteVideo.srcObject || remoteVideo.srcObject.id !== stream.id) {
    localVideo.classList.toggle("full-screen-video");
    localVideo.classList.toggle("secondary-video");
    remoteVideo.classList.toggle("full-screen-video");
    remoteVideo.classList.toggle("secondary-video");
    remoteVideo.srcObject = stream;
  }
}


export function NewVideoCall(roomNo, callback) {
  room = roomNo;

  console.log("creating or joining room: " + room);
  socket.emit('user:join', room, callback);
}

export function OpenLocalMedia(options) {
  navigator.mediaDevices.getUserMedia({...options})
  .then(stream => {
    localStream = stream;
    // Display your local video in #localVideo element
    const localVideo = document.getElementById('localVideo');
    localVideo.srcObject = stream;
    localVideo.muted = true;

    socket.emit('user:rtc:ready', room);
  })
  .catch(err => console.log(err))
}