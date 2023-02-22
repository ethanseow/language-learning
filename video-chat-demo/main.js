let localStream;
let remoteStream;
let peerConnection;

let APP_ID = "1fdc7c11eac04d77bff199b2f4face24";
let token = null;
let uid = String(Math.floor(Math.random() * 10000));

let client;
let channel;

const servers = {
	iceServers: [
		{
			urls: [
				"stun:stun1.l.google.com:19302",
				"stun:stun2.l.google.com:19302",
			],
		},
	],
};

let init = async () => {
	client = await AgoraRTM.createInstance(APP_ID);
	await client.login({ uid, token });
	channel = client.createChannel("main");
	await channel.join();
	channel.on("MemberJoined", handleUserJoined);
	client.on("MessageFromPeer", handleMessageFromPeer);
	localStream = await navigator.mediaDevices.getUserMedia({
		video: true,
		audio: false,
	});
	document.getElementById("user-1").srcObject = localStream;
};

let handleMessageFromPeer = async (message, peerId) => {
	console.log("Received message from", peerId);
	console.log(message.text);
};

let handleUserJoined = async (MemberId) => {
	console.log("A new user joined the channel", MemberId);
	createOffer(MemberId);
};

let createOffer = async (MemberId) => {
	peerConnection = new RTCPeerConnection(servers);
	remoteStream = new MediaStream();
	document.getElementById("user-2").srcObject = remoteStream;

	localStream.getTracks().forEach((track) => {
		peerConnection.addTrack(track);
	});
	peerConnection.ontrack = (event) => {
		event.streams[0].getTracks().forEach((track) => {
			remoteStream.addTrack(track);
		});
	};
	peerConnection.onicecandidate = async (event) => {
		if (event.candidate) {
			//console.log("New ICE Candidate:", event.candidate);
		}
	};

	let offer = await peerConnection.createOffer();
	await peerConnection.setLocalDescription(offer);
	client.sendMessageToPeer({ text: "Hello world!" }, MemberId);
	console.log("sending message");
	//console.log("Offer:", offer);
};
init();
