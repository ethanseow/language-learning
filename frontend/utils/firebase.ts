import { Session } from "~~/stores/sessions";
import {
	DocumentData,
	DocumentReference,
	Firestore,
	QueryDocumentSnapshot,
	SnapshotOptions,
	Timestamp,
	addDoc,
	collection,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	limit,
	query,
	setDoc,
	updateDoc,
	where,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, type User as FirebaseUser } from "firebase/auth";
//import firebaseConsts from "~~/constants/firebaseConsts";
type FirebaseSession = Omit<Session, "appointmentDate"> & {
	appointmentDate: Timestamp;
};

export type User = {
	uid: string;
	username: string;
};

export type Feedback = {
	sessionId: string;
	feedback: string;
	fromName: string;
	fromUserId: string;
};

type SessionDocumentData = DocumentData & FirebaseSession;
type UserDocumentData = DocumentData & User;
type FeedbackDocumentData = DocumentData & Feedback;

export const sessionConverter = {
	toFirestore(session: Session): DocumentData {
		console.log("Session", session);
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
		//@ts-ignore
		const data: SessionDocumentData = snapshot.data(options);
		const id = data.id || snapshot.id;
		const {
			appointmentDate,
			languageOffering,
			languageSeeking,
			peerName,
			userId,
		} = data;
		return {
			id,
			appointmentDate: appointmentDate?.toDate(),
			languageOffering,
			languageSeeking,
			peerName,
			userId,
		};
	},
};

export const userConverter = {
	toFirestore(user: User): DocumentData {
		return {
			uid: user.uid,
			username: user.username,
		};
	},
	fromFirestore(
		snapshot: QueryDocumentSnapshot,
		options: SnapshotOptions
	): User {
		//@ts-ignore
		const data: UserDocumentData = snapshot.data(options);
		const { uid, username } = data;
		return {
			uid,
			username,
		};
	},
};

export const feedbackConverter = {
	toFirestore(f: Feedback): DocumentData {
		return {
			sessionId: f.sessionId,
			f: f.feedback,
			fromName: f.fromName,
			fromUserId: f.fromUserId,
		};
	},
	fromFirestore(
		snapshot: QueryDocumentSnapshot,
		options: SnapshotOptions
	): Feedback {
		//@ts-ignore
		const data: FeedbackDocumentData = snapshot.data(options);
		return data;
	},
};

export const getSessions = async (
	firestore: Firestore,
	isPast: boolean,
	userId: string
) => {
	const sessionRef = collection(firestore, "sessions").withConverter(
		sessionConverter
	);
	const now = Timestamp.now();
	const q = query(
		sessionRef,
		where("userId", "==", userId),
		where("appointmentDate", isPast ? "<" : ">=", now)
	);
	const docs = await getDocs(q);
	const temp: Session[] = [];
	docs.forEach((doc) => {
		temp.push({ ...doc.data() });
	});
	return temp;
};

// write a unit test for this
export const userHasSession = async (
	firestore: Firestore,
	userId: string,
	offering: string,
	seeking: string,
	sessionTime: Date
) => {
	//firebaseConsts.sessionCollection
	const sessionRef = collection(firestore, "sessions").withConverter(
		sessionConverter
	);
	const q = query(
		sessionRef,
		where("userId", "==", userId),
		where("languageOffering", "==", offering),
		where("languageSeeking", "==", seeking),
		where("appointmentDate", "==", sessionTime),
		limit(1)
	);
	const docs = await getDocs(q);
	docs.forEach((doc) => {
		return doc;
	});
	return null;
};

export const createSession = async (session: Session) => {
	const fs = useNuxtApp().$firestore;

	const sessionRef = collection(
		fs,
		firebaseConsts.sessionCollection
	).withConverter(sessionConverter);

	// Add a new document with a generated id.
	try {
		console.log("added doc");
		const docRef = await addDoc(sessionRef, session);
		return docRef;
	} catch (error) {
		console.log(error);
		return null;
	}
};

export const getUser = async (uid: string) => {
	const fs = useNuxtApp().$firestore;
	//console.log("fs", fs);
	const userRef = collection(fs, firebaseConsts.users).withConverter(
		userConverter
	);
	const q = query(userRef, where("uid", "==", uid));
	const docs = await getDocs(q);
	/*
	const sessionRef = collection(
		fs,
		firebaseConsts.sessionCollection
	).withConverter(sessionConverter);
	const allDocs = await getDocs(sessionRef);
	console.log("before data all");
	allDocs.forEach((d) => {
		console.log("Data:", d.id, d.data());
	});
	console.log("after data all");
    */

	console.log("in getUser - finished using useNuxtApp");
	if (docs.empty) {
		console.log("error - no users with that uid");
		return null;
	} else {
		const user = docs.docs[0].data();
		return user;
	}
};

export const createOrGetUser = async (user: FirebaseUser) => {
	const fs = useNuxtApp().$firestore;

	const newUser: User = {
		//@ts-ignore
		username: user.displayName,
		uid: user.uid,
	};

	// Add a new document with a generated id.
	try {
		await setDoc(
			doc(fs, firebaseConsts.users, user.uid),
			{
				...newUser,
			},
			{
				merge: true,
			}
		);
		return newUser;
	} catch (error) {
		console.log(error);
		return null;
	}
};

export type FeedbackUser = {
	userId: string;
	name: string;
};

export const createRating = async (
	sessionId: string,
	feedback: string,
	name: string,
	userId: string
) => {
	const fs = useNuxtApp().$firestore;
	try {
		const docRef = await addDoc(collection(fs, firebaseConsts.feedback), {
			sessionId,
			feedback,
			fromName: name,
			fromUserId: userId,
		});
		return docRef;
	} catch (error) {
		console.log(error);
		return null;
	}
};
export const updateRating = async (
	doc: DocumentReference<DocumentData>,
	feedback: string
) => {
	await updateDoc(doc, {
		feedback,
	});
};
export const searchRating = async (sessionId: string) => {
	const fs = useNuxtApp().$firestore;
	const feedbackRef = collection(fs, firebaseConsts.feedback).withConverter(
		feedbackConverter
	);
	const q = query(feedbackRef, where("sessionId", "==", sessionId));
	const docs = await getDocs(q);
	if (docs.empty) {
		return null;
	} else {
		const user = docs.docs[0].data();
		return user;
	}
};
