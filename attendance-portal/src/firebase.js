import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBy_uj6ItFg-eC6s5joQmIa5RClVWv_d-E",
  authDomain: "attendance-portal-6d926.firebaseapp.com",
  databaseURL: "https://attendance-portal-6d926-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "attendance-portal-6d926",
  storageBucket: "attendance-portal-6d926.firebasestorage.app",
  messagingSenderId: "350383854570",
  appId: "1:350383854570:web:f8814262720a925b9cd893",
  measurementId: "G-H0WFHBVT7L"
};

if (!firebaseConfig.databaseURL) {
  console.error("❌ databaseURL is missing!");
}

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
console.log("🔥 Firebase DB URL:", firebaseConfig.databaseURL);