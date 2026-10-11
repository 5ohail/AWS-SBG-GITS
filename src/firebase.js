import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD9tpzLSD2nQ2z3i6ud9h3_C8GAiVtbQs",
  authDomain: "fir-02-20f3a.firebaseapp.com",
  projectId: "fir-02-20f3a",
  storageBucket: "fir-02-20f3a.firebasestorage.app",
  messagingSenderId: "179086483589",
  appId: "1:179086483589:web:cbe5ef98177c700853c9ec",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
