// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDc4x-o1UdumBWqgbsz82ZyJRi_wPrH80U",
  authDomain: "lekplatsen-907fb.firebaseapp.com",
  projectId: "lekplatsen-907fb",
  storageBucket: "lekplatsen-907fb.firebasestorage.app",
  messagingSenderId: "802816415281",
  appId: "1:802816415281:web:0f5eab57a99443b8d46710",
  measurementId: "G-8VY9PQVQWC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);