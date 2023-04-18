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
	query,
	setDoc,
	where,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, type User as FirebaseUser } from "firebase/auth";

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
		const data: UserDocumentData = snapshot.data(options);
		const { uid, username } = data;
		return {
			uid,
			username,
		};
	},
};

export const getSessions = async (isPast: boolean, userId: string) => {
	console.log("calling getSessions");
	const fs = useFirebase().$firestore.value;
	console.log("after fs initialization");
	const sessionRef = collection(
		fs,
		firebaseConsts.sessionCollection
	).withConverter(sessionConverter);
	console.log("after sessionRef initialization");
	const now = Timestamp.now();
	const q = query(
		sessionRef,
		where("userId", "==", userId),
		where("appointmentDate", isPast ? "<" : ">=", now)
	);
	console.log("after query initialization");
	const docs = await getDocs(q);
	console.log("after getDocs ");
	const temp: Session[] = [];
	docs.forEach((doc) => {
		temp.push(doc.data());
	});
	console.log("temp", temp);
	return temp;
};

export const createSession = async (session: Session) => {
	const fs = useFirebase().$firestore.value;

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
	const fs = useFirebase().$firestore.value;

	const userRef = collection(fs, firebaseConsts.users).withConverter(
		userConverter
	);
	const q = query(userRef, where("uid", "==", uid));
	const docs = await getDocs(q);

	if (docs.empty) {
		console.log("error - no users with that uid");
		return null;
	} else {
		const user = docs.docs[0].data();
		return user;
	}
};

export const createOrGetUser = async (user: FirebaseUser) => {
	const fs = useFirebase().$firestore.value;

	const newUser: User = {
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
