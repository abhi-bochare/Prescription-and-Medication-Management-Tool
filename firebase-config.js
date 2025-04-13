import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDP1FSTG2N8jVaLnV1jFTKr7h2TP9kjT_w",
  authDomain: "prescription-and-medication.firebaseapp.com",
  projectId: "prescription-and-medication",
  storageBucket: "prescription-and-medication.firebasestorage.app",
  messagingSenderId: "13817378902",
  appId: "1:13817378902:web:1e1519382aedd0293423f7",
  measurementId: "G-CSVNCD4FTS",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
