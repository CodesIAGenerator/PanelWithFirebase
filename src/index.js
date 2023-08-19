import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { initializeApp } from 'firebase/app';
import 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB14zochkvee2M-NQbS5B44IHBeXlhxL7U",
  authDomain: "test-react-b62b0.firebaseapp.com",
  projectId: "test-react-b62b0",
  storageBucket: "test-react-b62b0.appspot.com",
  messagingSenderId: "176752899009",
  appId: "1:176752899009:web:1a81a6527f53299bb0b540",
  measurementId: "G-3T1SMZGS54"
};

initializeApp(firebaseConfig);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
