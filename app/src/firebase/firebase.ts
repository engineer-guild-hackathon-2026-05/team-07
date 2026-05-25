import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDFJFMY7-0_qvoQFcPW9A9-1AXys4PG5mg",
  authDomain: "egh-team7.firebaseapp.com",
  projectId: "egh-team7",
  storageBucket: "egh-team7.firebasestorage.app",
  messagingSenderId: "213567420882",
  appId: "1:213567420882:web:b6a285878e56a7cbcd700b"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
