<template>
	<div class="flex flex-row justify-start p-2">
		<div
			v-if="!isFullyConnected"
			class="fixed flex flex-col justify-center items-center inset-0 w-screen h-screen bg-background"
		>
			<p class="text-xl">Finding Available Partners</p>
			<LoadingSpinner />
		</div>
		<div
			v-if="hasEndedMeeting"
			class="fixed flex flex-col justify-center items-center inset-0 w-screen h-screen bg-background"
		>
			<p class="text-xl">Meeting Has Ended</p>
		</div>
		<div
			v-if="alreadyInRoom"
			class="fixed flex flex-col justify-center items-center inset-0 w-screen h-screen bg-background"
		>
			<p class="text-xl">Already in room</p>
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
		<button id="endMeeting" class="p-4 bg-blue-600" @click="endMeeting">
			End Meeting
		</button>
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
import { type Ref } from "vue";

const hasEndedMeeting = ref(false);
const setHasEndedMeeting = (v: boolean) => {
	hasEndedMeeting.value = v;
};
const alreadyInRoom = ref(false);

const endMeeting = () => {
	rtc.socket.emit(SocketEmits.TRIGGER_END_MEETING);
};

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
//@ts-ignore
let localStream: Ref<MediaStream> = ref();
//@ts-ignore
let remoteStream: Ref<MediaStream> = ref();
//@ts-ignore
let localSourceHTML: Ref<HTMLMediaElement> = ref();
//@ts-ignore
let remoteSourceHTML: Ref<HTMLMediaElement> = ref();

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
	//@ts-ignore
	const offering: string = route.query?.offering?.toString();
	//@ts-ignore
	const seeking: string = route.query?.seeking?.toString();
	//@ts-ignore
	const userId: string = useAuth().user.value?.uid;
	console.log("initRTC - my userId", userId);
	//@ts-ignore
	//const cookie = useCookie("authCookie")?.value;
	//console.log("initRTC - useCookie", cookie);

	rtc = new RTCMocker(offering, seeking, userId);

	rtc.rtcConnect();
	rtc.socketConnect();
	rtc.waitForRoom();
};

const initStreams = async () => {
	remoteStream.value = new MediaStream();
	remoteSourceHTML.value.srcObject = remoteStream.value;
	try {
		localStream.value = await navigator.mediaDevices.getUserMedia({
			...constraints,
		});
	} catch (error) {
		console.log("initStreams getUserMedia");
	}

	console.log("initStreams", localStream.value);
	localSourceHTML.value.srcObject = localStream.value;
	localStream.value.getTracks().forEach((track) => {
		rtc.peerConnection.addTrack(track, localStream.value);
	});

	try {
		rtc.peerConnection.ontrack = (event) => {
			try {
				event.streams[0].getTracks().forEach((track) => {
					remoteStream.value.addTrack(track);
				});
			} catch (error) {
				console.log("ontrack", error);
			}
		};
	} catch (error) {
		console.log("outside ontrack", error);
	}
};

const initExtraSocketHandlers = () => {
	// this will only deal with ui and frontend stuff and should not touch the rtcmocker
	rtc?.socket.on(SocketEmits.END_MEETING, () => {
		setHasEndedMeeting(true);
	});
	rtc?.socket.on(SocketEmits.ALREADY_IN_ROOM, () => {
		alreadyInRoom.value = true;
	});
};

/*
    have end meeting be a bomb that is sent to both - aphelios bomb

    a socket will trigger the bomb
    the bomb will blow up affect both socket

    need to finish the index.ts route for this
*/

onMounted(async () => {
	initRTC();
	initRTCHandlers();
	initStreams();
	initExtraSocketHandlers();
});
onBeforeRouteLeave(() => {
	if (rtc) {
		rtc.disconnect();
	}
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
