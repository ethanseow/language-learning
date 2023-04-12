import { Session } from "~~/stores/sessions";
import {
	DocumentData,
	Firestore,
	QueryDocumentSnapshot,
	SnapshotOptions,
	Timestamp,
	addDoc,
	collection,
	getDocs,
	getFirestore,
	query,
	setDoc,
	where,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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

export const getSessions = async (isPast: boolean, userId: string) => {
	const fs = useNuxtApp().$firestore;
	const sessionRef = collection(
		fs,
		firebaseConsts.sessionCollection
	).withConverter(sessionConverter);
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

export const createSession = async (session: Session) => {
	const fs = useNuxtApp().$firestore;

	const sessionRef = collection(
		fs,
		firebaseConsts.sessionCollection
	).withConverter(sessionConverter);

	// Add a new document with a generated id.
	try {
		const docRef = await addDoc(sessionRef, session);

		return docRef;
	} catch (error) {
		console.log(error);
		return null;
	}
};
