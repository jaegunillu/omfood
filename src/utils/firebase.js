"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.storage = exports.db = void 0;
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
const storage_1 = require("firebase/storage");
const auth_1 = require("firebase/auth");
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDmj59IeD2OpybVN-SQRzSbb_Bn-Pn3c60",
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "omfood-a621d.firebaseapp.com",
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "omfood-a621d",
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "gs://omfood-a621d.firebasestorage.app",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "666659241137",
    appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:666659241137:web:f5ffdeab131593997eb690",
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-8ZMLB6ZDB5"
};
const app = (0, app_1.initializeApp)(firebaseConfig);
exports.db = (0, firestore_1.getFirestore)(app);
exports.storage = (0, storage_1.getStorage)(app);
exports.auth = (0, auth_1.getAuth)(app);
