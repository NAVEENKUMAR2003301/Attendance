import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD6q5-FUtgQMHhOznecPb5zjFxwgY3h3IE",
  authDomain: "attendance-6ea49.firebaseapp.com",
  databaseURL: "https://attendance-6ea49-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "attendance-6ea49",
  storageBucket: "attendance-6ea49.firebasestorage.app",
  messagingSenderId: "473428822021",
  appId: "1:473428822021:web:ef3caec6ae71d322b2f46c",
  measurementId: "G-1HQ5JXVXYZ"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
console.log("🔥 Firebase DB URL:", firebaseConfig.databaseURL);