import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyB14zochkvee2M-NQbS5B44IHBeXlhxL7U",
    authDomain: "test-react-b62b0.firebaseapp.com",
    projectId: "test-react-b62b0",
    storageBucket: "test-react-b62b0.appspot.com",
    messagingSenderId: "176752899009",
    appId: "1:176752899009:web:1a81a6527f53299bb0b540",
    measurementId: "G-3T1SMZGS54"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, provider, signInWithPopup, signOut, firestore, storage };