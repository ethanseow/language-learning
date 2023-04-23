import { Session } from "~~/stores/sessions";
import {
	DocumentData,
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

type SessionDocumentData = DocumentData & FirebaseSession;
type UserDocumentData = DocumentData & User;

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
export const test = async (f: Firestore) => {
	collection(f, "sessions");
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
export const userHasMatchingSession = async (
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
