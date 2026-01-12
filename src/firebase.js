import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration provided by user
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyCFVa6P_n9qrIejrZHwTeu-i0rpXhEOiNM',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'porto-yithro-e1680.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'porto-yithro-e1680',
  // Typical bucket domain for Firebase Storage is <project>.appspot.com
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'porto-yithro-e1680.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER || '130789193042',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:130789193042:web:40719adde7a9fc4142f68b',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export const db = getFirestore(app);

export default app;
