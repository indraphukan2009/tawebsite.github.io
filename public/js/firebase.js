// src/firebase.js

// Import Firebase modules directly from the CDN (no install needed)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { getFunctions } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-functions.js";

// 🔽 Replace everything inside this object with your Firebase config from the console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_AUTH_DOMAIN_HERE",
  projectId: "YOUR_PROJECT_ID_HERE",
  storageBucket: "YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "YOUR_SENDER_ID_HERE",
  appId: "YOUR_APP_ID_HERE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services for use in your site
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
