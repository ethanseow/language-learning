<template>
	<div class="flex flex-row justify-start p-2">
		<div class="text-black flex flex-col items-center">
			<div>Meeting Room</div>
			<h1>Room: {{ roomId !== "NULL" ? roomId : "WAITING" }}</h1>
			<button class="p-3 bg-blue-600" @click="toggleState">
				Toggle State
			</button>
			<div id="videos">
				<video
					class="video-player"
					autoplay
					playsinline
					ref="localUser"
				></video>
				<div
					class="video-player flex flex-col justify-center items-center"
					v-show="socketState == false"
				>
					Waiting For User
				</div>
				<div class="video-player" v-show="socketState == true">
					<video
						class="w-full h-full"
						autoplay
						playsinline
						ref="remoteUser"
					></video>
				</div>
			</div>
			<button class="p-4 bg-blue-600" @click="endMeeting">
				End Meeting
			</button>
			<h1 class="text-black">
				{{ connectionStateText }}
			</h1>
		</div>
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
import { io } from "socket.io-client";
import webRTC from "@/backend-api/webRTC";
const peerConnection: Ref<RTCPeerConnection> = ref();
const localUser: Ref<HTMLVideoElement> = ref();
const remoteUser: Ref<HTMLVideoElement> = ref();
const localStream: Ref<MediaStream> = ref();
const remoteStream: Ref<MediaStream> = ref();
const partnerId: Ref<string> = ref(null);
const socketState = ref(false);

const allMessages: Ref<Message[]> = ref([
	{
		ownerId: "123",
		data: "partner message",
		id: "xyz",
		timestamp: new Date(),
	},
	{
		ownerId: "6045_8619",
		data: "owner message",
		id: "xyz",
		timestamp: new Date(),
	},
]);
const message = ref("");
const sendMessage = (event: any) => {
	if (textChatSocket.active) {
		const data: Message = {
			id: new Crypto().randomUUID(),
			data: message.value,
			ownerId: userId.value,
			timestamp: new Date(),
		};
		textChatSocket.emit(SocketEmits.SEND_MESSAGE, data);
	}
};

const connectionState: Ref<RTCIceConnectionState> = ref("closed");
const connectionStateText = computed(() => {
	if (connectionState.value) {
		switch (connectionState.value) {
			case "checking":
				return "Checking";
			case "completed":
				return "Completed";
			case "closed":
				return "Closed";
				break;
			case "connected":
				return "Connected";
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
const toggleState = () => {
	socketState.value = !socketState.value;
};

const ownerMessages = computed(() => {
	return allMessages.value.filter((message) => {
		return message.ownerId == userId.value;
	});
});

const partnerMessages = computed(() => {
	return allMessages.value.filter((message) => {
		return message.ownerId == partnerId.value;
	});
});

const roomId = ref("NULL");
const userId = useCookie("userId");
const apiBase = useRuntimeConfig().public.apiBase;

const webRtcRoute = apiBase + SocketNamespaces.WEB_RTC;
const textChatRoute = apiBase + SocketNamespaces.TEXT_CHAT;

const webRtcSocket = io(webRtcRoute, {
	withCredentials: true,
});

const textChatSocket = io(textChatRoute, { withCredentials: true });

onMounted(async () => {
	if (!userId.value) {
		userId.value =
			String(Math.round(Math.random() * 10000)) +
			"_" +
			String(Math.round(Math.random() * 10000));
		useAccountStore().setUserId(userId.value);
	}
	await rtcInit();
	webRtcSocketInit();
});

let constraints = {
	video: {
		width: { min: 640, ideal: 1920, max: 1920 },
		height: { min: 480, ideal: 1080, max: 1080 },
	},
	audio: false,
};

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
		webRtcSocket.emit(SocketEmits.EMIT_CANDIDATE, data);
	}
};

const onTrack = (event: RTCTrackEvent) => {
	event.streams[0].getTracks().forEach((track) => {
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
	remoteStream.value = new MediaStream();
	remoteUser.value.srcObject = remoteStream.value;
	localStream.value.getTracks().forEach((track) => {
		peerConnection.value.addTrack(track, localStream.value);
	});

	peerConnection.value.ontrack = onTrack;
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
	peerConnection.value.removeEventListener("icecandidate", onIceCandidate);
	peerConnection.value.close();
	// refresh new peerConnection
	peerConnection.value = new RTCPeerConnection(webRTC.servers);
};

const endMeeting = () => {
	//socket.emit(SocketEmits.CLOSE_MEETING);
	peerConnection.value.close();
	remoteUser.value.srcObject = null;
};

const webRtcSocketInit = () => {
	const data: JoinRoomReq = {
		userId: userId.value,
	};
	webRtcSocket.emit(SocketEmits.WAIT_FOR_ROOM, data);
	webRtcSocket.on(SocketEmits.JOIN_ROOM, async (data: JoinedRoomReq) => {
		startConnection();
		textChatSocketInit();
		roomId.value = data.roomId;
		if (userId.value == data.host) {
			partnerId.value = data.guest;
			console.log("I am the host");
			console.log("creating offer");
			createOffer();
		} else {
			console.log("I am the guest");
			partnerId.value = data.guest;
		}
	});
	webRtcSocket.on(SocketEmits.EMIT_CANDIDATE, (data: CandidateFoundReq) => {
		console.log("Got ice candidate");
		if (peerConnection.value) {
			console.log("Adding ice candidate");
			peerConnection.value.addIceCandidate(data.candidate);
		}
	});
	webRtcSocket.on(SocketEmits.EMIT_OFFER, async (data: SendOfferReq) => {
		console.log("Accepting offer");
		acceptOffer(data.offer);
	});
	webRtcSocket.on(SocketEmits.EMIT_ANSWER, async (data: SendAnswerReq) => {
		console.log("Accepting answer");
		acceptAnswer(data.answer);
	});
	webRtcSocket.on(SocketEmits.PARTNER_DISCONNECTED, () => {
		stopConnection();
	});
};

const textChatSocketInit = async () => {
	textChatSocket.emit(SocketEmits.GET_ALL_MESSAGES, {}, (response: any) => {
		const messages: Message[] = response.message;
		allMessages.value = messages;
	});
	textChatSocket.on(SocketEmits.SEND_MESSAGE, (message: Message) => {
		console.log("Previous allMessage", allMessages);
		console.log("Previous owner messages", ownerMessages);
		console.log("Previous partner messages", partnerMessages);
		allMessages.value.push(message);
		console.log("Appended allMessage", allMessages);
		console.log("New owner messages", ownerMessages);
		console.log("New partner messages", partnerMessages);
	});
};

const createOffer = async () => {
	let offer = await peerConnection.value.createOffer();
	await peerConnection.value.setLocalDescription(offer);
	const data: SendOfferReq = {
		offer,
	};
	webRtcSocket.emit(SocketEmits.EMIT_OFFER, data);
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
	webRtcSocket.emit(SocketEmits.EMIT_ANSWER, data);
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
