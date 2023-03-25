<template>
	<div class="flex flex-row justify-start p-2">
		<div
			v-if="socketState == false && roomId == null"
			class="fixed flex flex-col justify-center items-center inset-0 w-screen h-screen bg-background"
		>
			<p class="text-xl">Finding Available Partners</p>
			<LoadingSpinner />
		</div>
		<div class="text-black flex flex-col items-center">
			<div>Meeting Room</div>
			<h1>Room: {{ roomId !== "NULL" ? roomId : "WAITING" }}</h1>
			<button class="p-4 bg-purple-700 w-max" @click="openScreenShare">
				Open Screen Share
			</button>
			<button class="p-4 bg-green-700 w-max" @click="newTrack">
				Open New Track
			</button>
			<video src="" id="myVideo"></video>
			<div id="videos">
				<video
					class="video-player"
					autoplay
					playsinline
					ref="localUser"
				></video>
				<div class="video-player">
					<video
						class="w-full h-full"
						autoplay
						playsinline
						ref="shareScreenElem"
					></video>
				</div>
				<div
					class="video-player flex flex-col justify-center items-center"
					v-show="socketState == false && roomId != null"
				>
					<p>User Disconnected</p>
					<p>Waiting For User</p>
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

const screenIsSharing = ref(false);
const screenStream: Ref<MediaStream> = ref();
const remoteScreenStream: Ref<MediaStream> = ref();
const shareScreenElem: Ref<HTMLVideoElement> = ref();
/*
const toggleShareScreen = async () => {
	const prevScreenIsSharing = screenIsSharing.value;
	screenIsSharing.value = !screenIsSharing.value;
    if(screenIsSharing.value){
		if (screenStream == null || screenStream == undefined) {
			const stream = await navigator.mediaDevices.getDisplayMedia({
				audio: false,
				video: true,
			});
			screenStream.value = stream;
        }
        screenStream.value.getTracks()
        peerConnection.value.addTrack('screenShare',screenStream.value)

    }
	if (screenIsSharing.value) {
			const stream = await navigator.mediaDevices.getDisplayMedia({
				audio: false,
				video: true,
			});
			screenStream.value = stream;
		}else{

        }
	}else{

    }
};

shareScreen

*/

const message = ref("");
const sendMessage = () => {
	if (socket.active) {
		const data: Message = {
			id: crypto.randomUUID(),
			data: message.value,
			ownerId: userId.value,
			timestamp: new Date(),
		};
		allMessages.value.push(data);
		socket.emit(SocketEmits.SEND_MESSAGE, data);
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

const roomId = ref(null);
const userId = useCookie("userId");
const apiBase = useRuntimeConfig().public.apiBase;
const allMessages: Ref<Message[]> = ref([
	//{
	//ownerId: "123",
	//data: "partner message",
	//id: "xyz",
	//timestamp: new Date(),
	//},
	//{
	//ownerId: userId.value,
	//data: "owner message",
	//id: "xyz",
	//timestamp: new Date(),
	//},
]);

const socket = io(apiBase, {
	withCredentials: true,
});

onMounted(async () => {
	if (!userId.value) {
		userId.value =
			String(Math.round(Math.random() * 10000)) +
			"_" +
			String(Math.round(Math.random() * 10000));
		useAccountStore().setUserId(userId.value);
	}
	await rtcInit();
	socketInit();
});

let constraints = {
	video: false,
	/*{
		width: { min: 640, ideal: 1920, max: 1920 },
		height: { min: 480, ideal: 1080, max: 1080 },
	}*/ audio: true,
};
const newTrack = () => {
	const videoElement = document.getElementById("myVideo");
	const videoTrack = videoElement.captureStream().getVideoTracks()[0];
	const mediaStream = new MediaStream();
	mediaStream.addTrack(videoTrack);
	peerConnection.value.addTrack(videoTrack, mediaStream);
};
const openScreenShare = async () => {
	screenIsSharing.value = true;
	screenStream.value = await navigator.mediaDevices.getDisplayMedia();
	shareScreenElem.value.srcObject = screenStream.value;
	// need to make sure that this is properly done before getTracks (ack)
	screenStream.value.getTracks().forEach((track) => {
		console.log("sending tracks", track);
		if (peerConnection.value.connectionState != "connected") {
			console.log("Not socket state");
			return;
		}
		peerConnection.value.addTrack(track, screenStream.value);
	});
	/*
	socket.emit(SocketEmits.SHARE_SCREEN, {}, (ackData: string) => {
		console.log(ackData);
		// need some way to close peerConnection screen share
		screenStream.value.getTracks().forEach((track) => {
			console.log("sending tracks", track);
			if (peerConnection.value.connectionState != "connected") {
				console.log("Not socket state");
				return;
			}
			peerConnection.value.addTrack(track, screenStream.value);
		});
	});
    */
};

const handlePartnerScreenShare = () => {
	/*
	// if I am already sharing screen
	if (screenIsSharing.value) {
	    screenStream.value.getTracks().forEach(() => {});
	    shareScreenElem.value.srcObject = screenStream.value;
	    peerConnection.value.addEventListener("track", onShareScreenTrack);
	}
    */
	console.log("handling partner screen share");
	screenIsSharing.value = true;
	screenStream.value = new MediaStream();
	remoteScreenStream.value = new MediaStream();
	shareScreenElem.value.srcObject = remoteScreenStream.value;
};

const closeScreenShare = async () => {
	screenIsSharing.value = false;
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
// can't have two event handlers - they will clash, both will run at same time, need some conditional
const onShareScreenTrack = (event: RTCTrackEvent) => {
	console.log(event.streams);
	event.streams[0].getTracks().forEach((track) => {
		console.log("Getting Share Screen Track");
		remoteScreenStream.value.addTrack(track);
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
	/*
        3 - 11 - 2023
        share screen issues, only one person can share a screen at a time
        person sharing screen should not be able to see own screen
        rtc streams and tracks resolution (see onTrack function)

        stop sharing screen, start sharing screen button

        requirements:
        one person can share screen at a time
        if another person share screen, popup will ask that you will cancel other's share screen
        share screen is based on onclick only

        share screen button
        screenStream
        screenStreamViewable
        on click - emit a share screen to other user, closes any screenStream/viewable on both parties, 
        then reinstantiates own screenStream as partner's screenStreamViewable

        can we do this all within the same peerConnection?

    */

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

const socketInit = () => {
	const data: JoinRoomReq = {
		userId: userId.value,
	};
	socket.emit(SocketEmits.WAIT_FOR_ROOM, data);
	socket.on(SocketEmits.JOIN_ROOM, async (data: JoinedRoomReq) => {
		startConnection();
		roomId.value = data.roomId;
		if (userId.value == data.host) {
			partnerId.value = data.guest;
			console.log("I am the host");
			console.log("creating offer");
			createOffer();
		} else {
			loadAllMessages();
			console.log("I am the guest");
			partnerId.value = data.guest;
		}
	});
	socket.on(SocketEmits.EMIT_CANDIDATE, (data: CandidateFoundReq) => {
		console.log("Got ice candidate");
		if (peerConnection.value) {
			console.log("Adding ice candidate");
			peerConnection.value.addIceCandidate(data.candidate);
		}
	});
	socket.on(SocketEmits.EMIT_OFFER, async (data: SendOfferReq) => {
		console.log("Accepting offer");
		acceptOffer(data.offer);
	});
	socket.on(SocketEmits.EMIT_ANSWER, async (data: SendAnswerReq) => {
		console.log("Accepting answer");
		acceptAnswer(data.answer);
	});
	socket.on(SocketEmits.PARTNER_DISCONNECTED, () => {
		stopConnection();
	});
	socket.on(SocketEmits.SHARE_SCREEN, () => {
		handlePartnerScreenShare();
	});
	socket.on(SocketEmits.SEND_MESSAGE, (message: Message) => {
		console.log("Previous allMessage", allMessages.value);
		allMessages.value.push(message);
		console.log("Appended allMessage", allMessages.value);
	});
};

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
			allMessages.value = messages;
		}
	);
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
