// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyCWwOJeoCHYbdzEy6cGw9UimfxsL7P2iik",
	authDomain: "lingk-bbd04.firebaseapp.com",
	projectId: "lingk-bbd04",
	storageBucket: "lingk-bbd04.appspot.com",
	messagingSenderId: "149765528274",
	appId: "1:149765528274:web:25b3e52852db3a9112ab0b",
	measurementId: "G-2QTL937X1J",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
