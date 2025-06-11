import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC9N8mauoHvjoktREtMm6MS66vlG7zd-Gs",
  authDomain: "omfood-a621d.firebaseapp.com",
  projectId: "omfood-a621d",
  storageBucket: "omfood-a621d.firebasestorage.app",
  messagingSenderId: "666659241137",
  appId: "1:666659241137:web:f5ffdeab131593997eb690",
  measurementId: "G-8ZMLB6ZDB5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app); 