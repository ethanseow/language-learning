import { Session } from "~~/stores/sessions";
import {
	DocumentData,
	Firestore,
	QueryDocumentSnapshot,
	SnapshotOptions,
	Timestamp,
	collection,
	getDocs,
	query,
	where,
} from "firebase/firestore";
type FirebaseSession = Omit<Session, "appointmentDate"> & {
	appointmentDate: Timestamp;
};
type SessionDocumentData = DocumentData & FirebaseSession;

export const sessionConverter = {
	toFirestore(session: Session): DocumentData {
		return {
			appointmentDate: Timestamp.fromDate(session.appointmentDate),
			languageOffering: session.languageOffering,
			languageSeeking: session.languageSeeking,
			peerName: session.peerName,
			userId: session.userId,
		};
	},
	fromFirestore(
		snapshot: QueryDocumentSnapshot,
		options: SnapshotOptions
	): Session {
		const data: SessionDocumentData = snapshot.data(options);
		const {
			appointmentDate,
			languageOffering,
			languageSeeking,
			peerName,
			userId,
		} = data;
		return {
			appointmentDate: appointmentDate?.toDate(),
			languageOffering,
			languageSeeking,
			peerName,
			userId,
		};
	},
};

const fireStore: Firestore = useNuxtApp().$firestore;
const sessionRef = collection(
	fireStore,
	firebaseConsts.sessionCollection
).withConverter(sessionConverter);

export const getSessions = async (isPast: boolean, userId: string) => {
	const now = Timestamp.now();
	const q = query(
		sessionRef,
		where("userId", "==", userId),
		where("appointmentDate", isPast ? "<" : ">=", now)
	);
	const docs = await getDocs(q);
	const temp: Session[] = [];
	docs.forEach((doc) => {
		temp.push(doc.data());
	});
	return temp;
};
