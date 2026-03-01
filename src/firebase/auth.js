import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	signInWithPopup,
	GoogleAuthProvider
} from "firebase/auth";
import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();

export function loginUser(email, password) {
	return signInWithEmailAndPassword(auth, email, password);
}

export function registerUser(email, password) {
	return createUserWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle() {
	return signInWithPopup(auth, googleProvider);
}

export function logoutUser() {
	return signOut(auth);
}
