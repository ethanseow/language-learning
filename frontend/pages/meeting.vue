<template>
	<div class="text-black flex flex-col items-center">
		<div>Meeting Room</div>
		<h1>Room: {{ roomId !== "NULL" ? roomId : "WAITING" }}</h1>
		<div id="videos">
			<video
				class="video-player"
				autoplay
				playsinline
				ref="localUser"
			></video>
			<video
				class="video-player"
				autoplay
				playsinline
				ref="remoteUser"
			></video>
		</div>
		<button class="p-4 bg-blue-600" @click="endMeeting">End Meeting</button>
		<h1 class="text-black">
			{{ connectionState }}
		</h1>
		<button @click="emitAnswer">Emit Answer</button>
	</div>
</template>

<script setup lang="ts">
import axios from "axios";
import { type Ref } from "vue";
import {
	type JoinRoomReq,
	type JoinedRoomReq,
	type PartnerJoinedReq,
	type CandidateFoundReq,
	type SendOfferReq,
	type SendAnswerReq,
} from "@/backend-api/sockets";
import { SocketEmits } from "~~/backend-api/sockets";
import { io } from "socket.io-client";
import webRTC from "@/backend-api/webRTC";

const peerConnection: Ref<RTCPeerConnection> = ref();
const localUser: Ref<HTMLVideoElement> = ref();
const remoteUser: Ref<HTMLVideoElement> = ref();
const localStream: Ref<MediaStream> = ref();
const remoteStream: Ref<MediaStream> = ref();

const connectionState = computed(() => {
	console.log(peerConnection.value);
	if (peerConnection.value != undefined || peerConnection.value != null) {
		switch (peerConnection.value.connectionState) {
			case "closed":
				return "Closed";
				break;
			case "connected":
				return "Connected";
				break;
			case "connecting":
				return "Connecting";
				break;
			case "failed":
				return "Failed";
				break;
			case "new":
				return "New";
				break;
			case "disconnected":
				return "Disconnected";
				break;
			default:
				return "Unknown";
		}
	} else {
		return "Unestablished";
	}
});

const roomId = ref("NULL");
const userId = useCookie("userId");
const apiBase = useRuntimeConfig().public.apiBase;
const socket = io(apiBase, {
	withCredentials: true,
});
const emitAnswer = () => {
	socket.emit("emitAnswers");
};
onMounted(async () => {
	if (!userId.value) {
		userId.value =
			String(Math.round(Math.random() * 10000)) +
			"_" +
			String(Math.round(Math.random() * 10000));
	}
	await createPeerConnection();
	socketInit();
});

let constraints = {
	video: {
		width: { min: 640, ideal: 1920, max: 1920 },
		height: { min: 480, ideal: 1080, max: 1080 },
	},
	audio: false,
};

const endMeeting = () => {
	socket.emit(SocketEmits.CLOSE_MEETING);
	peerConnection.value.close();
	remoteUser.value.srcObject = null;
};

const socketInit = () => {
	const data: JoinRoomReq = {
		userId: userId.value,
	};
	socket.emit(SocketEmits.WAIT_FOR_ROOM, data);
	socket.on(SocketEmits.JOIN_ROOM, (data: JoinedRoomReq) => {
		roomId.value = data.roomId;
		if (userId.value == data.host) {
			console.log("I am the host");
			console.log("creating offer");
			createOffer();
		} else {
			console.log("I am the guest");
		}
	});
	socket.on(SocketEmits.EMIT_CANDIDATE, (data: CandidateFoundReq) => {
		console.log("Got ice candidate");
		if (peerConnection.value) {
			console.log("Adding ice candidate");
			peerConnection.value.addIceCandidate(data.candidate);
		}
	});
	socket.on(SocketEmits.PARTNER_JOINED, (data: PartnerJoinedReq) => {});
	socket.on(SocketEmits.EMIT_OFFER, async (data: SendOfferReq) => {
		console.log("Accepting offer");
		acceptOffer(data.offer);
	});
	socket.on(SocketEmits.EMIT_ANSWER, async (data: SendAnswerReq) => {
		console.log("Accepting answer");
		acceptAnswer(data.answer);
	});
};

const createPeerConnection = async () => {
	localStream.value = await navigator.mediaDevices.getUserMedia(constraints);

	localUser.value.srcObject = localStream.value;
	peerConnection.value = new RTCPeerConnection(webRTC.servers);
	remoteStream.value = new MediaStream();
	remoteUser.value.srcObject = remoteStream.value;

	localStream.value.getTracks().forEach((track) => {
		peerConnection.value.addTrack(track, localStream.value);
	});

	peerConnection.value.ontrack = (event) => {
		event.streams[0].getTracks().forEach((track) => {
			remoteStream.value.addTrack(track);
		});
	};

	peerConnection.value.onicecandidate = async (event) => {
		if (event.candidate) {
			const data: CandidateFoundReq = {
				candidate: event.candidate,
			};
			socket.emit(SocketEmits.EMIT_CANDIDATE, data);
		}
	};
};

const createOffer = async () => {
	let offer = await peerConnection.value.createOffer();
	await peerConnection.value.setLocalDescription(offer);
	const data: SendOfferReq = {
		offer,
	};
	socket.emit(SocketEmits.EMIT_OFFER, data);
};

const acceptOffer = async (offer: RTCSessionDescriptionInit) => {
	console.log("at accept offer function");
	await peerConnection.value.setRemoteDescription(offer);

	let answer = await peerConnection.value.createAnswer();
	await peerConnection.value.setLocalDescription(answer);
	console.log("setting local description");

	let data: SendAnswerReq = {
		answer,
	};
	console.log("emitting socket");
	socket.emit(SocketEmits.EMIT_ANSWER, data);
};

const acceptAnswer = async (answer: RTCSessionDescriptionInit) => {
	if (!peerConnection.value.currentRemoteDescription) {
		console.log("fully connected");
		peerConnection.value.setRemoteDescription(answer);
	}
};
</script>

<style scoped>
.video-player {
	border: 1px black solid;
	margin-top: 3rem;
	width: 250px;
	height: 200px;
}
</style>
