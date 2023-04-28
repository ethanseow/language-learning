<template>
	<div class="flex flex-row justify-start p-2">
		<div
			v-if="!isFullyConnected"
			class="fixed flex flex-col justify-center items-center inset-0 w-screen h-screen bg-background"
		>
			<p class="text-xl">Finding Available Partners</p>
			<LoadingSpinner />
		</div>
		<div class="text-black flex flex-col items-center">
			<div>Meeting Room</div>
			<h1>Room: {{ roomId }}}}</h1>
			<div id="videos">
				<video
					class="video-player"
					autoplay
					playsinline
					ref="localUser"
				></video>
				<div
					class="video-player flex flex-col justify-center items-center"
					v-show="!isPartnerConnected"
				>
					<p>User Disconnected</p>
					<p>Waiting For User</p>
				</div>
				<div class="video-player" v-show="isPartnerConnected">
					<video
						class="w-full h-full"
						autoplay
						playsinline
						ref="remoteUser"
					></video>
				</div>
			</div>
		</div>
		<!--
			<button class="p-4 bg-blue-600" @click="endMeeting">
				End Meeting
			</button>
		<div class="flex flex-col w-full">
			<div class="grow bg-slate-500 h-[90%]">
				<Message
					v-for="message in allMessages"
					:message="message"
				></Message>
			</div>
			<div class="h-max bg-green-600 w-full p-4">
				<label for="message">Message: </label>
				<input
					name="message"
					type="text"
					class="text-black"
					v-model="message"
				/>
				<button class="ml-3 bg-blue-300 p-1" @click="sendMessage">
					Enter
				</button>
			</div>
		</div>
        -->
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
	type Message,
	SocketNamespaces,
} from "@/backend-api/sockets";
import { useAccountStore } from "@/stores/account";
import { SocketEmits } from "~~/backend-api/sockets";
import { Socket, io } from "socket.io-client";
import webRTC from "@/backend-api/webRTC";

definePageMeta({
	//middleware: ["auth", "user-meetings"],
	middleware: ["auth"],
});

//@ts-ignore
const peerConnection: Ref<RTCPeerConnection> = ref();
//@ts-ignore
const localUser: Ref<HTMLVideoElement> = ref();
//@ts-ignore
const remoteUser: Ref<HTMLVideoElement> = ref();
//@ts-ignore
const localStream: Ref<MediaStream> = ref();
//@ts-ignore
const remoteStream: Ref<MediaStream> = ref();

const RTCConnectionState = ref("");
const setRTCConnectionState = (state: string) => {
	RTCConnectionState.value = state;
};

const RTCSignalingState = ref("");
const setRTCSignalingState = (state: string) => {
	RTCSignalingState.value = state;
};

const isFullyConnected = computed(() => {
	if (isFullyConnected.value) {
		return true;
	}
	if (
		RTCConnectionState.value == "connected" &&
		RTCSignalingState.value == "stable"
	) {
		return true;
	}
	return false;
});

const isPartnerConnected = computed(() => {
	if (isFullyConnected.value) {
		if (RTCConnectionState.value == "connected") {
			return true;
		} else {
			return false;
		}
	}
	return false;
});

const polite = ref(null);
const makingOffer = ref(false);

const initRTCEventHandlers = async () => {
	peerConnection.value.onsignalingstatechange = (e) => {
		switch (peerConnection.value.signalingState) {
			case "stable":
				setRTCSignalingState("stable");
				break;
			default:
				break;
		}
	};
	peerConnection.value.onconnectionstatechange = (e) => {
		switch (peerConnection.value.connectionState) {
			case "new":
				setRTCConnectionState("new");
				break;
			case "connecting":
				setRTCConnectionState("connecting");
				break;
			case "connected":
				setRTCConnectionState("connected");
				break;
			case "disconnected":
				setRTCConnectionState("disconnected");
				break;
			case "closed":
				setRTCConnectionState("closed");
				break;
			case "failed":
				setRTCConnectionState("failed");
				break;
			default:
				break;
		}
	};
	peerConnection.value.oniceconnectionstatechange = () => {
		if (peerConnection.value.iceConnectionState === "failed") {
			peerConnection.value.restartIce();
		}
	};
	peerConnection.value.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
		if (e.candidate) {
			const data: CandidateFoundReq = {
				candidate: e.candidate,
			};
			socket.emit(SocketEmits.EMIT_CANDIDATE, data);
			socket.emit(SocketEmits.EMIT_CANDIDATE, e);
		}
	};
	peerConnection.value.ontrack = (event: RTCTrackEvent) => {
		console.log("track is added");
		event.streams[0].getTracks().forEach((track) => {
			//console.log(track);
			remoteStream.value.addTrack(track);
		});
	};
};

const roomId = ref(null);
const apiBase = useRuntimeConfig().public.apiBase;

const socket = io(apiBase, {
	withCredentials: true,
});

onMounted(async () => {
	socketInit();
});

let constraints = {
	video: {
		width: { min: 640, ideal: 1920, max: 1920 },
		height: { min: 480, ideal: 1080, max: 1080 },
	},
	audio: true,
};

/*
const rtcInit = async () => {
	localStream.value = await navigator.mediaDevices.getUserMedia(constraints);
	localUser.value.srcObject = localStream.value;
	peerConnection.value = new RTCPeerConnection(webRTC.servers);
};

const onIceCandidate = (event: RTCPeerConnectionIceEvent) => {
	if (event.candidate) {
		const data: CandidateFoundReq = {
			candidate: event.candidate,
		};
		socket.emit(SocketEmits.EMIT_CANDIDATE, data);
	}
};

// not running when screenShare is addTrack
const onTrack = (event: RTCTrackEvent) => {
	console.log("track is added");
	event.streams[0].getTracks().forEach((track) => {
		console.log(track);
		remoteStream.value.addTrack(track);
	});
};

const onIceConnectionStateChange = (event: any) => {
	connectionState.value = peerConnection.value.iceConnectionState;
	if (peerConnection.value.iceConnectionState === "connected") {
		socketState.value = true;
	}
};

const startConnection = async () => {
	localStream.value = await navigator.mediaDevices.getUserMedia(constraints);
	localUser.value.srcObject = localStream.value;
	console.log("before my peerconnection", peerConnection.value);
	peerConnection.value = new RTCPeerConnection(webRTC.servers);
	console.log("after my peerconnection", peerConnection.value);
	remoteStream.value = new MediaStream();
	remoteUser.value.srcObject = remoteStream.value;
	localStream.value.getTracks().forEach((track) => {
		peerConnection.value.addTrack(track, localStream.value);
	});
	peerConnection.value.addEventListener("track", onTrack);
	peerConnection.value.onicecandidate = onIceCandidate;
	peerConnection.value.oniceconnectionstatechange =
		onIceConnectionStateChange;
};

const stopConnection = async () => {
	localStream.value.getTracks().forEach(() => {});
	peerConnection.value.removeEventListener("track", onTrack);
	peerConnection.value.removeEventListener(
		"iceconnectionstatechange",
		onIceConnectionStateChange
	);
	socketState.value = false;
	remoteStream.value.getTracks().forEach((track) => {
		track.stop();
	});
	peerConnection.value.removeEventListener("icecandidate", onIceCandidate);
	peerConnection.value.removeEventListener("track", onTrack);
	peerConnection.value.removeEventListener(
		"iceconnectionstatechange",
		onIceConnectionStateChange
	);
	peerConnection.value.close();
	// refresh new peerConnection
	peerConnection.value = new RTCPeerConnection(webRTC.servers);
};

const endMeeting = () => {
	//socket.emit(SocketEmits.CLOSE_MEETING);
	peerConnection.value.close();
	remoteUser.value.srcObject = null;
};
*/

const socketInit = async () => {
	const data: JoinRoomReq = {
		// you can have this be sent as cookie or auth header
		userId: useAuth().user.value.uid,
		//@ts-ignore
		offering: useRoute().query.offering,
		//@ts-ignore
		seeking: useRoute().query.seeking,
	};

	localStream.value = await navigator.mediaDevices.getUserMedia(constraints);
	localUser.value.srcObject = localStream.value;
	// console.log("before my peerconnection", peerConnection.value);
	peerConnection.value = new RTCPeerConnection(webRTC.servers);
	// console.log("after my peerconnection", peerConnection.value);
	remoteStream.value = new MediaStream();
	remoteUser.value.srcObject = remoteStream.value;
	localStream.value.getTracks().forEach((track) => {
		peerConnection.value.addTrack(track, localStream.value);
	});

	initRTCEventHandlers();

	socket.emit(SocketEmits.WAIT_FOR_ROOM, data);

	socket.on(SocketEmits.CREATED_ROOM, async (data: JoinedRoomReq) => {
		//@ts-ignore
		polite.value = data.isPolite;
		createOffer();
	});

	socket.on(SocketEmits.ASK_POLITENESS, async () => {
		socket.emit(SocketEmits.ASK_POLITENESS, {
			myPolite: polite.value,
		});
	});

	socket.on(SocketEmits.REJOIN_ROOM, async (data: JoinedRoomReq) => {
		//@ts-ignore
		polite.value = data.isPolite;
		createOffer();
	});
	socket.on(SocketEmits.EMIT_CANDIDATE, (data: CandidateFoundReq) => {
		console.log("Got ice candidate");
		if (peerConnection.value) {
			console.log("Adding ice candidate");
			peerConnection.value.addIceCandidate(data.candidate);
		}
	});
	socket.on(SocketEmits.EMIT_OFFER, async (data: SendOfferReq) => {
		console.log("received an offer");
		const offeringRightNow =
			peerConnection.value.signalingState !== "stable" &&
			makingOffer.value;
		const denyOffer = polite.value == false && offeringRightNow;
		console.log("denyOffer", denyOffer);
		console.log("offeringRightNow", offeringRightNow);
		if (denyOffer) {
			console.log("Denied Offer");
			return;
		}
		makingOffer.value = false;
		console.log("Accepted Offer");
		acceptOffer(data.offer);
	});
	socket.on(SocketEmits.EMIT_ANSWER, async (data: SendAnswerReq) => {
		console.log("Accepting answer");
		acceptAnswer(data.answer);
	});
	/*
	socket.on(SocketEmits.PARTNER_DISCONNECTED, () => {
		stopConnection();
	});
    */
};

/*
	socket.on(SocketEmits.SEND_MESSAGE, (message: Message) => {
		console.log("Previous allMessage", allMessages.value);
		allMessages.value.push(message);
		console.log("Appended allMessage", allMessages.value);
	});
const loadAllMessages = async () => {
	socket.emit(
		SocketEmits.GET_ALL_MESSAGES,
		{ emptyArg: "emptyArg" },
		(response: any) => {
			console.log(
				"loadAllMessages - Got all messages",
				response.messages
			);
			const messages: Message[] = response.messages;
			if (messages) {
				allMessages.value = messages;
			}
		}
	);
};
*/

const createOffer = async () => {
	makingOffer.value = true;
	await peerConnection.value.setLocalDescription();
	const data: SendOfferReq = {
		//@ts-ignore
		offer: peerConnection.value.localDescription,
	};
	socket.emit(SocketEmits.EMIT_OFFER, data);
};

const acceptOffer = async (offer: RTCSessionDescriptionInit) => {
	makingOffer.value = false;
	console.log("at accept offer function");
	await peerConnection.value.setRemoteDescription(offer);

	// let answer = await peerConnection.value.createAnswer();
	await peerConnection.value.setLocalDescription();
	console.log("setting answer local description");

	let data: SendAnswerReq = {
		//@ts-ignore
		answer: peerConnection.value.localDescription,
	};
	console.log("emitting answer");
	socket.emit(SocketEmits.EMIT_ANSWER, data);
};

const acceptAnswer = async (answer: RTCSessionDescriptionInit) => {
	if (!peerConnection.value.currentRemoteDescription) {
		console.log("accepted answer");
		peerConnection.value.setRemoteDescription(answer);
		makingOffer.value = false;
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
