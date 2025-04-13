import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  get,
  set,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { remove } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

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
    loadMeds();
    loadProfile();
  } else {
    alert("You must be logged in to access medications.");
    window.location.href = "index.html";
  }
});

// Add medication
export async function addMed() {
  if (!userId) {
    alert("User not authenticated. Please log in.");
    return;
  }
  console.log("Add Medication clicked!");
  const name = document.getElementById("name").value;
  const dosage = document.getElementById("dosage").value;
  const frequency = document.getElementById("frequency").value;
  const time = document.getElementById("time").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

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

    alert("Medication added Successfully...!");
    clearForm();
  } catch (error) {
    console.error("Error adding medication:", error);
    alert("Failed to add medication. Please try again...!");
  }
}

// Clear input fields
function clearForm() {
  ["name", "dosage", "frequency", "time", "startDate", "endDate"].forEach(
    (id) => {
      document.getElementById(id).value = "";
    }
  );

  const btn = document.querySelector("button");
  btn.textContent = "Add Medication";
  btn.onclick = addMed;

  isEditing = false;
  currentMedId = null;
}

// Fetch and display medications
const medList = document.getElementById("medList");
async function loadMeds() {
  try {
    const medList = document.getElementById("medList");
    if (!medList) return;

    const medRef = ref(db, `users/${userId}/medications`);
    const snapshot = await get(medRef);
    const meds = snapshot.val();
    medList.innerHTML = "";

    if (meds) {
      Object.entries(meds).forEach(([id, med]) => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
          <strong>${med.name}</strong> (${med.dosage})<br>
          ${med.frequency} at ${med.time}<br>
          From ${med.startDate} to ${med.endDate}
          <br><br>
          <button onclick="markAsTaken('${id}', '${
          med.name
        }')">✔ Mark as Taken</button>
          <button onclick="requestRenewal('${id}', '${
          med.name
        }')">🔁 Request Renewal</button>
          <button onclick="editMed('${id}', ${JSON.stringify(med).replace(
          /"/g,
          "&quot;"
        )})">✏ Edit</button>
          <button onclick="deleteMed('${id}')">❌ Delete</button>
        `;
        console.log("Loading meds for user:", userId);

        medList.appendChild(div);
      });
    } else {
      medList.innerHTML = "<p>No medications found.</p>";
    }
  } catch (error) {
    console.error("Error loading medications:", error);
    medList.innerHTML =
      "<p>Failed to load medications. Please try again later...!</p>";
  }
}

// Delete Medication
window.deleteMed = async function (medId) {
  if (confirm("Are you sure you want to delete this medication?")) {
    try {
      const medRef = ref(db, `users/${userId}/medications/${medId}`);
      const snapshot = await get(medRef);

      if (snapshot.exists()) {
        const deletedMed = snapshot.val();
        deletedMed.deletedAt = new Date().toISOString();

        const historyRef = ref(db, `users/${userId}/medicationHistory`);
        const newHistory = push(historyRef);
        await set(newHistory, deletedMed);
      }

      await remove(medRef);

      loadMeds();
    } catch (error) {
      console.error("Error deleting medication:", error);
      alert(
        "An error occurred while deleting the medication. Please try again...!"
      );
    }
  }
};

// Edit Medication
let isEditing = false;
let currentMedId = null;

window.editMed = function (medId, medData) {
  currentMedId = medId;
  window.location.href = `add.html?edit=${medId}`;
};

async function loadMedForEditing(medId) {
  try {
    const medRef = ref(db, `users/${userId}/medications/${medId}`);
    const snapshot = await get(medRef);
    const medData = snapshot.val();

    if (medData) {
      document.getElementById("name").value = medData.name;
      document.getElementById("dosage").value = medData.dosage;
      document.getElementById("frequency").value = medData.frequency;
      document.getElementById("time").value = medData.time;
      document.getElementById("startDate").value = medData.startDate;
      document.getElementById("endDate").value = medData.endDate;

      const btn = document.getElementById("submitMedBtn");
      btn.textContent = "Save Changes";
      btn.onclick = function () {
        saveEdit(medId);
      };
    }
  } catch (error) {
    console.error("Error loading medication for editing:", error);
    alert("Failed to load medication for editing.");
  }
}

async function saveEdit() {
  if (!userId || !currentMedId) {
    alert(
      "Cannot save changes. User not logged in or medication not selected."
    );
    return;
  }

  const updatedMed = {
    name: document.getElementById("name").value,
    dosage: document.getElementById("dosage").value,
    frequency: document.getElementById("frequency").value,
    time: document.getElementById("time").value,
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value,
  };

  try {
    const medRef = ref(db, `users/${userId}/medications/${currentMedId}`);
    await set(medRef, updatedMed);

    alert("Medication updated!");

    clearForm();
    loadMeds();

    isEditing = false;
    currentMedId = null;
    const btn = document.getElementById("submitMedBtn");
    btn.textContent = "Add Medication";
    btn.onclick = addMed;
  } catch (error) {
    console.error("Error saving edited medication:", error);
    alert("Failed to update medication.");
  }
}

window.markAsTaken = async function (medId, medName) {
  alert(`${medName} marked as taken!`);
};

window.requestRenewal = async function (medId, medName) {
  alert(`Renewal requested for ${medName}`);
};

//Health Information
document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const profileData = {
    name: document.getElementById("pname").value,
    age: document.getElementById("age").value,
    weight: document.getElementById("weight").value,
    gender: document.getElementById("gender").value,
    disease: document.getElementById("disease").value,
    allergies: document.getElementById("allergies").value,
    doctorName: document.getElementById("doctorName").value,
    doctorContact: document.getElementById("doctorContact").value,
  };

  try {
    await set(ref(db, `users/${userId}/profile`), profileData);
    alert("Profile saved!");
    loadProfile();
  } catch (error) {
    console.error("Error saving profile:", error);
    alert("Failed to save profile.");
  }
});

//Load Health Information

async function loadProfile() {
  const display = document.getElementById("profileDisplay");
  if (!display) return;

  try {
    const snap = await get(ref(db, `users/${userId}/profile`));
    if (snap.exists()) {
      const p = snap.val();
      display.innerHTML = `
        <h3>Saved Profile</h3>
        <p><strong>Name:</strong> ${p.name}</p>
        <p><strong>Age:</strong> ${p.age}</p>
        <p><strong>Weight:</strong> ${p.weight} kg</p>
        <p><strong>Gender:</strong> ${p.gender}</p>
        <p><strong>Disease:</strong> ${p.disease}</p>
        <p><strong>Allergies:</strong> ${p.allergies}</p>
        <p><strong>Doctor Name:</strong> ${p.doctorName}</p>
        <p><strong>Doctor Contact:</strong> ${p.doctorContact}</p>
      `;
    } else {
      display.innerHTML = "<p>No profile information found.</p>";
    }
  } catch (error) {
    console.error("Error loading profile:", error);
    display.innerHTML = "<p>Error loading profile data.</p>";
  }
}
