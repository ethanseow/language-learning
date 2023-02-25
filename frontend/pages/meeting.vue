<template>
	<div class="text-black flex flex-col items-center">
		<div>Meeting Room</div>
		<button class="p-4 bg-blue-600" @click="askServer">Ask Server</button>
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

const isInitiator = ref(false);
const roomId = ref("NULL");
const userId = useCookie("userId");

const apiBase = useRuntimeConfig().public.apiBase;
const socket = io(apiBase, {
	withCredentials: true,
});
const askServer = () => {
	socket.emit("askServer");
};
onMounted(() => {
	if (!userId.value) {
		userId.value =
			String(Math.round(Math.random() * 10000)) +
			"_" +
			String(Math.round(Math.random() * 10000));
	}
	createPeerConnection();
	socketInit();
});

let constraints = {
	video: {
		width: { min: 640, ideal: 1920, max: 1920 },
		height: { min: 480, ideal: 1080, max: 1080 },
	},
	audio: false,
};

const socketInit = () => {
	const data: JoinRoomReq = {
		userId: userId.value,
	};
	socket.emit(SocketEmits.WAIT_FOR_ROOM, data);
	socket.on(SocketEmits.JOIN_ROOM, (data: JoinedRoomReq) => {
		roomId.value = data.roomId;
		isInitiator.value = data.isInitiator;
		if (isInitiator.value == true) {
			console.log("creating offer");
			createOffer();
		}
	});
	socket.on(SocketEmits.EMIT_CANDIDATE, (data: CandidateFoundReq) => {
		if (peerConnection.value) {
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
	await peerConnection.value.setRemoteDescription(offer);

	let answer = await peerConnection.value.createAnswer();
	await peerConnection.value.setLocalDescription(answer);

	let data: SendAnswerReq = {
		answer,
	};
	socket.emit(SocketEmits.EMIT_ANSWER, data);
};

const acceptAnswer = async (answer: RTCSessionDescriptionInit) => {
	if (!peerConnection.value.currentRemoteDescription) {
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
