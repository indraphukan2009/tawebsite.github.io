// public/js/main.js
// ---------- imports ----------
import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  doc, setDoc, getDoc,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// ---------- helpers ----------
const onPage = (name) =>
  window.location.pathname.toLowerCase().endsWith(name.toLowerCase());

function requireRoleOn(pageFile, role, redirectTo) {
  if (!onPage(pageFile)) return;
  onAuthStateChanged(auth, async (user) => {
    if (!user) return (window.location.href = redirectTo);
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.exists() ? snap.data() : null;
      if (!data || data.role !== role) window.location.href = redirectTo;
    } catch (e) {
      console.error("role check failed", e);
      window.location.href = redirectTo;
    }
  });
}

async function getUserProfile() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) return resolve(null);
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        resolve(snap.exists() ? snap.data() : null);
      } catch (e) {
        console.error("profile load failed", e);
        resolve(null);
      }
    });
  });
}

async function showElementsForRole() {
  const profile = await getUserProfile();
  if (!profile) return;
  document.querySelectorAll("[data-role]").forEach((el) => {
    const role = el.getAttribute("data-role");
    el.style.display = profile.role === role ? "block" : "none";
  });
}

// ---------- global handlers ----------
document.addEventListener("click", async (e) => {
  // Sign out (works anywhere)
  const signOutBtn = e.target.closest("#signOutBtn");
  if (signOutBtn) {
    e.preventDefault();
    try {
      await signOut(auth);
      window.location.href = "index.html";
    } catch (err) {
      console.error(err);
      alert(err.message || "Sign out failed.");
    }
  }

  // Teacher test shortcut (poo button) -> always jump to tDash
  const poo = e.target.closest("#test2");
  if (poo && onPage("teacherLogin.html")) {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = "tDash.html";
  }
});

// ---------- nav wiring + page logic ----------
window.addEventListener("DOMContentLoaded", () => {
  // Home (index.html) nav buttons
  const studentButton = document.getElementById("studentBtn");
  if (studentButton) studentButton.addEventListener("click", () => (window.location.href = "studentLogin.html"));

  const teacherButton = document.getElementById("teacherBtn");
  if (teacherButton) teacherButton.addEventListener("click", () => (window.location.href = "teacherLogin.html"));

  const homeButton = document.getElementById("homeBtn");
  if (homeButton) homeButton.addEventListener("click", () => (window.location.href = "index.html"));

  const formBtn = document.getElementById("formBtn");
  if (formBtn) formBtn.addEventListener("click", () => (window.location.href = "submitForm.html"));

  const recButton = document.getElementById("recBtn");
  if (recButton) recButton.addEventListener("click", () => (window.location.href = "requestRec.html"));

  const back = document.getElementById("dash");
  if (back) back.addEventListener("click", () => (window.location.href = "stuDashboard.html"));

  const talog = document.getElementById("taLog");
  if (talog) talog.addEventListener("click", () => (window.location.href = "talog.html"));

  // Fix typo: tReq should go to recRequest.html
  const tReq = document.getElementById("tReq");
  if (tReq) tReq.addEventListener("click", () => (window.location.href = "recRequest.html"));

  const opButton = document.getElementById("teachBtn");
  if (opButton) opButton.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "stuDashboard.html";
  });

  // ----- Role radios + Create Account (index.html) -----
  const studentRadio = document.getElementById("studentRadio");
  const teacherRadio = document.getElementById("teacherRadio");
  const teacherAccess = document.getElementById("teacherAccess");
  const studentFields = document.getElementById("studentFields");

  const updateForm = () => {
    if (!studentRadio || !teacherRadio || !teacherAccess || !studentFields) return;
    const isTeacher = teacherRadio.checked;
    teacherAccess.style.display = isTeacher ? "block" : "none";
    studentFields.style.display = isTeacher ? "none" : "block";
  };
  if (studentRadio) studentRadio.addEventListener("change", updateForm);
  if (teacherRadio) teacherRadio.addEventListener("change", updateForm);
  updateForm();

  const accountForm = document.getElementById("accountForm");
  if (accountForm) {
    accountForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        if (studentRadio?.checked) {
          // Student signup
          const email = document.getElementById("email")?.value?.trim();
          const password = document.getElementById("Spassword")?.value;
          if (!email || !password) return alert("Student email and password required.");

          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await setDoc(doc(db, "users", cred.user.uid), {
            uid: cred.user.uid,
            role: "student",
            email,
            firstName: document.getElementById("fname")?.value?.trim() || "",
            lastName: document.getElementById("lname")?.value?.trim() || "",
            sid: document.getElementById("sid")?.value?.trim() || "",
            classOf: document.getElementById("clsof")?.value?.trim() || "",
            createdAt: Date.now(),
          });
          alert("Student account created! You can now log in.");
        } else if (teacherRadio?.checked) {
          // Teacher signup (requires access code)
          const accessCode = (document.getElementById("accessCode")?.value || "").trim();
          if (accessCode !== "245867") return alert("Invalid access code for teachers.");

          const email = document.getElementById("Tusername")?.value?.trim();
          const password = document.getElementById("Tpassword")?.value;
          if (!email || !password) return alert("Teacher email and password required.");

          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await setDoc(doc(db, "users", cred.user.uid), {
            uid: cred.user.uid,
            role: "teacher",
            email,
            lastName: document.getElementById("TLastName")?.value?.trim() || "",
            createdAt: Date.now(),
          });
          alert("Teacher account created! You can now log in.");
        } else {
          alert("Please select Student or Teacher.");
        }
      } catch (err) {
        console.error(err);
        alert(err.message || "Sign up failed.");
      }
    });
  }

  // ----- Student Login (studentLogin.html) -----
  if (onPage("studentLogin.html")) {
    const form = document.querySelector("form");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
          const email =
            document.getElementById("email")?.value?.trim() ||
            document.getElementById("Susername")?.value?.trim() || "";
          const password =
            document.getElementById("Password")?.value ||
            document.getElementById("Spassword")?.value || "";
          if (!email || !password) return alert("Email and password are required.");
          await signInWithEmailAndPassword(auth, email, password);
          window.location.href = "stuDashboard.html";
        } catch (err) {
          console.error(err);
          alert(err.message || "Student sign-in failed.");
        }
      });
    }
  }

  // ----- Teacher Login (teacherLogin.html) -----
  if (onPage("teacherLogin.html")) {
    const form = document.querySelector("form");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
          const accessCode = (document.getElementById("accod")?.value ||
                              document.getElementById("accessCode")?.value ||
                              "").trim();
          if (accessCode !== "245867") return alert("Access code is invalid.");

          const email = (document.getElementById("Tusername")?.value || "").trim();
          const password = (document.getElementById("Password")?.value ||
                            document.getElementById("Tpassword")?.value || "");
          if (!email || !password) return alert("Teacher email and password required.");

          await signInWithEmailAndPassword(auth, email, password);
          window.location.href = "tDash.html";
        } catch (err) {
          console.error(err);
          alert(err.message || "Teacher sign-in failed.");
        }
      });
    }
  }

  // show/hide role-specific UI (optional)
  showElementsForRole();
});

// ---------- dashboard guards ----------
requireRoleOn("stuDashboard.html", "student", "studentLogin.html");
requireRoleOn("tDash.html", "teacher", "teacherLogin.html");
