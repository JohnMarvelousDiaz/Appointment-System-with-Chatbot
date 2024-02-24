import { initializeApp } from "firebase/app";
import { getFirestore } from '@firebase/firestore';
import { getAuth } from '@firebase/auth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA1UaAV_5ZiXRDfVi2dcrpvya26eexpAFs",
  authDomain: "chatbot-b108a.firebaseapp.com",
  databaseURL: "https://chatbot-b108a-default-rtdb.firebaseio.com",
  projectId: "chatbot-b108a",
  storageBucket: "chatbot-b108a.appspot.com",
  messagingSenderId: "792100165428",
  appId: "1:792100165428:web:0d1ccf9d03734774a27761",
  measurementId: "G-2GKF0L8MTL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();


export { firebase, firestore };
