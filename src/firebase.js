import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAm8RgkaTiUTw60kPtdXFJXwlKy9vxvC1Q",
  authDomain: "school-payment-system-ff3da.firebaseapp.com",
  projectId: "school-payment-system-ff3da",
  storageBucket: "school-payment-system-ff3da.appspot.com",
  messagingSenderId: "318895185431",
  appId: "1:318895185431:web:0fe254831c8f443be84652"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Added Firestore export
export default app;
