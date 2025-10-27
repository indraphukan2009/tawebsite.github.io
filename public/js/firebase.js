// public/js/firebase.js

// Import Firebase modules directly from the CDN (no install needed)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { getFunctions } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-functions.js";

// Your Firebase config (copied from the console)
const firebaseConfig = {
  apiKey: "AIzaSyBBAwfnUOUx5gDje0HGID_k9NUvDt-2xbQ",
  authDomain: "ta-website-boi.firebaseapp.com",
  projectId: "ta-website-boi",
  storageBucket: "ta-website-boi.appspot.com",
  messagingSenderId: "913378743877",
  appId: "1:913378743877:web:62577c59a62d542095352c",
  measurementId: "G-7QFG9F2F63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// (debug) quick sanity logs — safe to keep or remove later
console.log("firebase.js loaded");
console.log("apiKey len:", (firebaseConfig.apiKey || "").length);

// Export Firebase services for use in your site
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
