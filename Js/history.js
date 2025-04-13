import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDP1FSTG2N8jVaLnV1jFTKr7h2TP9kjT_w",
  authDomain: "prescription-and-medication.firebaseapp.com",
  projectId: "prescription-and-medication",
  databaseURL:
    "https://prescription-and-medication-default-rtdb.asia-southeast1.firebasedatabase.app",
  messagingSenderId: "13817378902",
  appId: "1:13817378902:web:1e1519382aedd0293423f7",
  measurementId: "G-CSVNCD4FTS",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();

let userId = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    userId = user.uid;
    loadHistory();
  } else {
    alert("You must be logged in.");
    window.location.href = "index.html";
  }
});

async function loadHistory() {
  const historyList = document.getElementById("historyList");
  if (!historyList) return;

  try {
    const historyRef = ref(db, `users/${userId}/medicationHistory`);
    const snapshot = await get(historyRef);
    const history = snapshot.val();

    historyList.innerHTML = ""; // Clear list

    if (history) {
      Object.entries(history).forEach(([id, med]) => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
          <strong>${med.name}</strong> (${med.dosage})<br>
          ${med.frequency} at ${med.time}<br>
          From ${med.startDate} to ${med.endDate}<br>
          Deleted on: ${new Date(med.deletedAt).toLocaleString()}
        `;
        historyList.appendChild(div);
      });
    } else {
      historyList.innerHTML = "<p>No deleted medications found.</p>";
    }
  } catch (error) {
    console.error("Error loading medication history:", error);
    historyList.innerHTML =
      "<p>Failed to load history. Please try again later.</p>";
  }
}
