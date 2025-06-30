import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDmj59IeD2OpybVN-SQRzSbb_Bn-Pn3c60",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "omfood-a621d.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "omfood-a621d",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "gs://omfood-a621d.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "666659241137",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:666659241137:web:f5ffdeab131593997eb690",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-8ZMLB6ZDB5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app); 