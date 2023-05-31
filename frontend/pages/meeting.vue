<template>
	<div class="flex flex-row justify-start p-2">
		<div
			v-if="!isFullyConnected"
			class="fixed flex flex-col justify-center items-center inset-0 w-screen h-screen bg-background"
		>
			<p class="text-xl">Finding Available Partners</p>
			<LoadingSpinner />
		</div>
		<div class="text-white flex flex-col items-center">
			<div>Meeting Room</div>
			<div id="videos">
				<video
					class="video-player"
					autoplay
					playsinline
					ref="localSourceHTML"
				></video>
				<div
					class="video-player flex flex-col justify-center items-center"
					v-show="false"
				>
					<p>User Disconnected</p>
					<p>Waiting For User</p>
				</div>
				<div class="video-player" v-show="true">
					<video
						class="w-full h-full"
						autoplay
						playsinline
						ref="remoteSourceHTML"
					></video>
				</div>
			</div>
		</div>
		<!--
		<button class="p-4 bg-blue-600" @click="endMeeting">End Meeting</button>
        -->
		<div class="flex flex-col w-full">
			<div class="grow bg-slate-500 h-[90%]">
				<Message
					v-for="message in rtc?.messages?.value"
					:message="message"
				></Message>
			</div>
			<div class="h-max bg-green-600 w-full p-4">
				<label for="message">Message: </label>
				<input
					id="message-input"
					name="message"
					type="text"
					class="text-black"
					v-model="message"
				/>
				<button
					id="message-submit"
					class="ml-3 bg-blue-300 p-1"
					@click="sendMessage"
				>
					Enter
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { connect } from "socket.io-client";
import { RTCMocker } from "~~/utils/RTCMocker";

const message = ref("");
const sendMessage = () => {
	if (/^\s*$/.test(message.value)) {
		// when only white space or completely blank
	} else {
		rtc.rtcSendMessage(message.value);
	}
	message.value = "";
};
definePageMeta({
	middleware: ["auth", "user-meetings"],
});
let localStream: MediaStream;
let remoteStream: MediaStream;

//@ts-ignore
let localSourceHTML: HTMLMediaElement = ref();
//@ts-ignore
let remoteSourceHTML: HTMLMediaElement = ref();

let rtc: RTCMocker;
let constraints = {
	video: {
		width: { min: 640, ideal: 1920, max: 1920 },
		height: { min: 480, ideal: 1080, max: 1080 },
	},
	audio: true,
};

const isFullyConnected = computed(() => {
	return stableSignalingState.value && connectedConnectionState.value;
});
const stableSignalingState = ref(false);
const connectedConnectionState = ref(false);

const initRTCHandlers = async () => {
	rtc.peerConnection.addEventListener("signalingstatechange", (e) => {
		if (rtc.peerConnection.signalingState == "stable") {
			stableSignalingState.value = true;
		} else {
			stableSignalingState.value = false;
		}
	});

	rtc.peerConnection.addEventListener("connectionstatechange", (e) => {
		if (rtc.peerConnection.connectionState == "connected") {
			connectedConnectionState.value = true;
		} else {
			connectedConnectionState.value = false;
		}
	});
};

const initRTC = async () => {
	const route = useRoute();
	const offering = route.query?.offering?.toString();
	const seeking = route.query?.seeking?.toString();
	const userId = useAuth().user.value?.uid;
	//@ts-ignore
	const cookie = useCookie("authCookie")?.value;
	console.log("initRTC - useCookie", cookie);

	//@ts-ignore
	rtc = new RTCMocker(offering, seeking, userId, cookie);

	rtc.rtcConnect();
	rtc.socketConnect();
	rtc.waitForRoom();
};

const initStreams = async () => {
	remoteStream = new MediaStream();
	remoteSourceHTML.srcObject = remoteStream;

	if (!localStream) {
		localStream = await navigator.mediaDevices.getUserMedia({
			...constraints,
		});
		localSourceHTML.srcObject = localStream;
	}
	localStream.getTracks().forEach((track) => {
		rtc.peerConnection.addTrack(track, localStream);
	});

	rtc.peerConnection.ontrack = (event) => {
		event.streams[0].getTracks().forEach((track) => {
			remoteStream.addTrack(track);
		});
	};
};

onMounted(async () => {
	initRTC();
	initRTCHandlers();
	initStreams();
});
</script>

<style scoped>
.video-player {
	border: 1px black solid;
	margin-top: 3rem;
	width: 250px;
	height: 200px;
}
</style>
