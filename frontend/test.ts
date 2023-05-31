import { Firestore, collection } from "firebase/firestore";

export const test = async (f: Firestore) => {
	collection(f, "sessions");
};
