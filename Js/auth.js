import { auth } from "../firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const signupBtn = document.getElementById("signup-btn");
  const logoutBtn = document.getElementById("logoutBtn");

  // Loginn
  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value.trim();

      if (!email || !password) {
        document.getElementById("login-message").innerText =
          "All fields are required!";
        return;
      }

      try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "dashboard.html";
      } catch (error) {
        document.getElementById("login-message").innerText = error.message;
        console.error("Login error:", error);
      }
    });
  }

  // SignUp
  if (signupBtn) {
    signupBtn.addEventListener("click", async () => {
      const email = document.getElementById("signup-email").value.trim();
      const password = document.getElementById("signup-password").value.trim();

      if (!email || !password) {
        document.getElementById("signup-msg").innerText =
          "All fields are required!";
        return;
      }

      try {
        await createUserWithEmailAndPassword(auth, email, password);
        window.location.href = "login.html";
      } catch (error) {
        document.getElementById("signup-msg").innerText = error.message;
        console.error("Signup error:", error);
      }
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        window.location.href = "index.html";
      } catch (error) {
        console.error("Logout error:", error);
        let logouterror = document.getElementById("logout-error");
        logouterror.innerText = `Error Occured ${error}`;
      }
    });
  }
});
