/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDs14sgwxt4Eqa4yLb4rEquVj0yH_Uu-o8",
  authDomain: "gifted-catcher-dt8c4.firebaseapp.com",
  projectId: "gifted-catcher-dt8c4",
  storageBucket: "gifted-catcher-dt8c4.firebasestorage.app",
  messagingSenderId: "21277948734",
  appId: "1:21277948734:web:a58da7cf6dc62b56358a6f",
  firestoreDatabaseId: "ai-studio-expenseflow-a4360b2f-ba37-47ba-96e8-075968c814f0"
};

const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);

export const ensureAuth = async () => {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (e) {
      console.warn("Firebase anonymous sign-in warning:", e);
    }
  }
};
