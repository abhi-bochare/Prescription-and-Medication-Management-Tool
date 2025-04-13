import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  push,
  set,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

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
const auth = getAuth();
const db = getDatabase(app);

let userId = null;
let currentMedId = null;

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You must be logged in.");
    window.location.href = "index.html";
    return;
  }

  userId = user.uid;
  currentMedId = getQueryParam("edit");

  const btn = document.getElementById("submitMedBtn");

  if (currentMedId) {
    // Edit mode
    const medRef = ref(db, `users/${userId}/medications/${currentMedId}`);
    const snapshot = await get(medRef);
    const medData = snapshot.val();

    if (medData) {
      document.getElementById("name").value = medData.name;
      document.getElementById("dosage").value = medData.dosage;
      document.getElementById("frequency").value = medData.frequency;
      document.getElementById("time").value = medData.time;
      document.getElementById("startDate").value = medData.startDate;
      document.getElementById("endDate").value = medData.endDate;

      btn.textContent = "Save Changes";
      btn.onclick = async () => {
        const updatedMed = {
          name: document.getElementById("name").value,
          dosage: document.getElementById("dosage").value,
          frequency: document.getElementById("frequency").value,
          time: document.getElementById("time").value,
          startDate: document.getElementById("startDate").value,
          endDate: document.getElementById("endDate").value,
        };

        try {
          await set(medRef, updatedMed);
          alert("Medication updated successfully!");
          window.location.href = "dashboard.html";
        } catch (error) {
          console.error("Error updating medication:", error);
          alert("Failed to update medication.");
        }
      };
    }
  } else {
    // Add mode
    btn.textContent = "Add Medication";
    btn.onclick = async () => {
      const name = document.getElementById("name").value;
      const dosage = document.getElementById("dosage").value;
      const frequency = document.getElementById("frequency").value;
      const time = document.getElementById("time").value;
      const startDate = document.getElementById("startDate").value;
      const endDate = document.getElementById("endDate").value;

      if (!name || !dosage || !frequency || !time || !startDate || !endDate) {
        alert("Please fill in all fields.");
        return;
      }

      try {
        const medRef = ref(db, `users/${userId}/medications`);
        const newMed = push(medRef);

        await set(newMed, {
          name,
          dosage,
          frequency,
          time,
          startDate,
          endDate,
        });

        alert("Medication added successfully!");
        ["name", "dosage", "frequency", "time", "startDate", "endDate"].forEach(
          (id) => {
            document.getElementById(id).value = "";
          }
        );
        window.location.href = "dashboard.html";
      } catch (error) {
        console.error("Error adding medication:", error);
        alert("Failed to add medication.");
      }
    };
  }
});
