<template>
	<ClickOutside v-if="canShowFeedbackModal" :id="ids.outsideFeedback">
		<FeedbackModal
			v-click-outside="{
				id: ids.outsideFeedback,
				func: (e) => closeFeedbackModal(),
			}"
			class="m-auto"
			:sessionId="sessionSelected"
		/>
	</ClickOutside>
	<div class="w-full">
		<span class="font-semibold text-2xl">
			{{ props.usePastSession ? "Past Sessions" : "Upcoming Sessions" }}
		</span>
		<div class="w-full h-[2px] bg-black"></div>
		<table class="w-full text-black text-sm font-thin">
			<tr class="bg-gray-400 text-lg">
				<th>Date</th>
				<th>Language Offering</th>
				<th>Language Seeking</th>
				<th>Peer</th>
				<th>Peer Feedback</th>
				<th v-if="!props.usePastSession">Meeting Room</th>
				<th v-else></th>
			</tr>
			<tr
				:id="session.id"
				:key="session.id"
				v-for="session in sortedSessions"
				class="bg-gray-400"
			>
				<td>
					<div>{{ getDateTimeString(session.appointmentDate) }}</div>
				</td>
				<td>
					<div
						class="text-sm flex flex-row gap-3 w-full items-center justify-center"
					>
						<span>{{ session.languageOffering }}</span>
						<img
							:src="getFlagFromLang(session.languageOffering)"
							class="w-[30px] aspect-auto"
						/>
					</div>
				</td>
				<td>
					<div
						class="text-sm flex flex-row gap-3 w-full items-center justify-center"
					>
						<span>{{ session.languageSeeking }}</span>
						<img
							:src="getFlagFromLang(session.languageSeeking)"
							class="w-[30px] aspect-auto"
						/>
					</div>
				</td>
				<td>
					<NuxtLink
						to="/accounts/123"
						v-if="props.usePastSession"
						class="underline text-secondary underline-offset-2"
					>
						{{ session.peerName }}
					</NuxtLink>
					<div v-else class="text-black font-thin">N/A</div>
				</td>
				<td>
					<button
						v-if="props.usePastSession"
						@click="openFeedbackModal(session)"
						class="text-green-400 border-green-400 border-[2px] py-1 px-6 rounded-md"
					>
						View
					</button>
					<div v-else class="text-black font-thin">N/A</div>
				</td>
				<td
					v-if="!props.usePastSession"
					class="flex flex-row justify-center"
				>
					<div
						:id="`${session.id}-join-meeting`"
						v-if="true || allowMeetingRoom(session.appointmentDate)"
						@click="joinMeetingHandler(session)"
						class="bg-green-400 text-white border-white border-[2px] py-1 px-6 rounded-md font-bold"
					>
						<NuxtLink
							:to="`${urlConsts.MEETING}?offering=${session.languageOffering}&seeking=${session.languageSeeking}`"
						>
							Join Meeting!
						</NuxtLink>
					</div>

					<div
						v-else
						class="bg-red-400 text-white border-white border-[2px] py-1 px-4 rounded-md font-bold w-max"
					>
						Waiting
					</div>
				</td>
				<td v-else></td>
			</tr>
		</table>
	</div>
</template>
<style scoped>
table {
	table-layout: fixed;
	text-align: center;
}
tr:nth-child(odd) {
	background-color: rgb(197, 197, 197);
}
tr:nth-child(even) {
	background-color: white;
}
tr:not(:first-child) td {
	padding: 1rem 0 1rem 0;
}
</style>

<script setup lang="ts">
import { type ComputedRef } from "vue";
import { storeToRefs } from "pinia";
import { Session } from "~~/stores/sessions";
import { urlConsts } from "~~/constants/urlConsts";
import { searchRating } from "~~/utils/firebase";
const props = defineProps<{
	usePastSession: boolean | null;
	sessions: Session[];
}>();
const feedback = useSessionStore().feedback;
// this may not run because it is inside of a vue-if handler - session is undefined on button render
const joinMeetingHandler = (session: Session) => {
	// set session id for /rating to know which rating to update
	useRatingStore().setSessionId(session);
};

onMounted(() => {
	/*
	if (props.usePastSession) {
		console.log("onMounted - props.usePastSession");
		searchRating("287Ec5voA7RdndUWNQTA").then((value) => {
			console.log("searchRating", value);
		});
	}
    */
	if (props.usePastSession) {
		useSessionStore()
			.retrieveAllFeedback(props.sessions)
			.then(() => {
				console.log(
					"feedback after on mounted",
					useSessionStore().feedback
				);
			});
	}
});

const canShowFeedbackModal = ref(false);
const sessionSelected = ref();

const openFeedbackModal = (session: Session) => {
	console.log("openFeedbackModal sid", session);
	canShowFeedbackModal.value = true;
	sessionSelected.value = session;
};

const closeFeedbackModal = () => {
	canShowFeedbackModal.value = false;
	sessionSelected.value = null;
};

const sortedSessions = computed(() => {
	return props.sessions.slice().sort((a, b) => {
		return b.appointmentDate.getTime() - a.appointmentDate.getTime();
	});
});
const getDateTimeString = (date: Date) => {
	return `${
		months[date.getMonth()]
	} ${date.getDate()}, ${date.getFullYear()} - ${date.toLocaleString(
		"en-US",
		{ hour: "numeric", minute: "numeric", hour12: true }
	)}`;
};
const allowMeetingRoom = (date: Date) => {
	return true;
	const rightNow = new Date();

	// issue - should be 5 instead of 60 here
	const fiveMinutesInMs = 60 * 60 * 1000;
	if (Math.abs(date.getTime() - rightNow.getTime()) <= fiveMinutesInMs) {
		return true;
	}
	return false;
};
</script>
