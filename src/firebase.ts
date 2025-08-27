import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// 환경별 Firebase 설정
const getFirebaseConfig = () => {
  const env = process.env.REACT_APP_ENV || process.env.NODE_ENV;
  const useEmulator = process.env.REACT_APP_USE_EMULATOR === 'true';
  const isDevelopment = env === 'development';
  
  console.log(`[Firebase] 환경 변수: REACT_APP_ENV=${process.env.REACT_APP_ENV}, NODE_ENV=${process.env.NODE_ENV}, USE_EMULATOR=${process.env.REACT_APP_USE_EMULATOR}`);
  
  if (useEmulator) {
    // Emulator 환경 (로컬 개발용)
    console.log('[Firebase] Emulator 모드 - 로컬 개발 환경');
    return {
      apiKey: "demo-api-key",
      authDomain: "demo-project.firebaseapp.com",
      projectId: "demo-project",
      storageBucket: "demo-project.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:demo123456789",
      measurementId: "G-DEMO123456"
    };
  } else if (isDevelopment) {
    // 개발 환경 - 임시로 운영 환경 사용 (개발용 프로젝트 생성 전까지)
    console.log('[Firebase] 개발 환경 - 운영 DB 사용 (임시)');
    console.log('[Firebase] ⚠️ 주의: 개발 중 데이터 변경 시 운영에도 반영됩니다!');
    console.log('[Firebase] 💡 해결: omfood-dev 프로젝트 생성 후 완전 분리 가능');
    
    // 임시로 운영 환경과 동일하게 설정
    return {
      apiKey: process.env.REACT_APP_FIREBASE_PROD_API_KEY || "AIzaSyDmj59IeD2OpybVN-SQRzSbb_Bn-Pn3c60",
      authDomain: process.env.REACT_APP_FIREBASE_PROD_AUTH_DOMAIN || "omfood-a621d.firebaseapp.com",
      projectId: process.env.REACT_APP_FIREBASE_PROD_PROJECT_ID || "omfood-a621d",
      storageBucket: process.env.REACT_APP_FIREBASE_PROD_STORAGE_BUCKET || "gs://omfood-a621d.firebasestorage.app",
      messagingSenderId: process.env.REACT_APP_FIREBASE_PROD_MESSAGING_SENDER_ID || "666659241137",
      appId: process.env.REACT_APP_FIREBASE_PROD_APP_ID || "1:666659241137:web:f5ffdeab131593997eb690",
      measurementId: process.env.REACT_APP_FIREBASE_PROD_MEASUREMENT_ID || "G-8ZMLB6ZDB5"
    };
  } else {
    // 운영 환경 (배포용)
    return {
      apiKey: process.env.REACT_APP_FIREBASE_PROD_API_KEY || "AIzaSyDmj59IeD2OpybVN-SQRzSbb_Bn-Pn3c60",
      authDomain: process.env.REACT_APP_FIREBASE_PROD_AUTH_DOMAIN || "omfood-a621d.firebaseapp.com",
      projectId: process.env.REACT_APP_FIREBASE_PROD_PROJECT_ID || "omfood-a621d",
      storageBucket: process.env.REACT_APP_FIREBASE_PROD_STORAGE_BUCKET || "gs://omfood-a621d.firebasestorage.app",
      messagingSenderId: process.env.REACT_APP_FIREBASE_PROD_MESSAGING_SENDER_ID || "666659241137",
      appId: process.env.REACT_APP_FIREBASE_PROD_APP_ID || "1:666659241137:web:f5ffdeab131593997eb690",
      measurementId: process.env.REACT_APP_FIREBASE_PROD_MEASUREMENT_ID || "G-8ZMLB6ZDB5"
    };
  }
};

const firebaseConfig = getFirebaseConfig();

// 현재 환경 로그 출력
console.log(`[Firebase] 현재 환경: ${process.env.NODE_ENV}`);
console.log(`[Firebase] 프로젝트 ID: ${firebaseConfig.projectId}`);

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Emulator 연결 설정
if (process.env.REACT_APP_USE_EMULATOR === 'true') {
  console.log('[Firebase] Emulator 모드 활성화');
  try {
    // Firestore Emulator 연결
    connectFirestoreEmulator(db, 'localhost', 8080);
    // Auth Emulator 연결
    connectAuthEmulator(auth, 'http://localhost:9099');
    // Storage Emulator 연결
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('[Firebase] Emulator 연결 성공');
  } catch (error) {
    console.error('[Firebase] Emulator 연결 실패:', error);
    console.log('[Firebase] 운영 DB로 폴백합니다.');
  }
} 