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
  doc, setDoc, getDoc, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// ---------- helpers ----------
const onPage = (name) =>
  window.location.pathname.toLowerCase().endsWith(name.toLowerCase());

// Test mode detection
function isTestMode() {
  try {
    if (window.location.search && window.location.search.includes("test=1")) {
      sessionStorage.setItem("TEST_MODE", "1");
      return true;
    }
    return sessionStorage.getItem("TEST_MODE") === "1";
  } catch (e) {
    return false;
  }
}

function requireRoleOn(pageFile, role, redirectTo) {
  if (isTestMode()) return;
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

  // student dashboard uses id "taFormBtn" for the TA Form tile
  const taFormBtn = document.getElementById("taFormBtn");
  if (taFormBtn) taFormBtn.addEventListener("click", () => (window.location.href = "submitForm.html"));

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
            createdAt: serverTimestamp(),
          });
          alert("Student account created! You can now log in.");

        } else {
          // Teacher signup (requires access code)
          const accessCode = (document.getElementById("accessCode")?.value || "").trim();
          if (accessCode !== "245867") return alert("Invalid access code for teachers.");

          const email = document.getElementById("Tusername")?.value?.trim();
          const password = document.getElementById("Tpassword")?.value;
          const firstName = document.getElementById("TFirstName")?.value?.trim() || ""; // NEW
          const lastName  = document.getElementById("TLastName")?.value?.trim() || "";
          if (!email || !password) return alert("Teacher email and password required.");

          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await setDoc(doc(db, "users", cred.user.uid), {
            uid: cred.user.uid,
            role: "teacher",
            email,
            firstName,            // NEW
            lastName,
            createdAt: serverTimestamp(),
          });
          alert("Teacher account created! You can now log in.");
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

  // ----- Populate Teacher Dashboard info (tDash.html) -----
  if (onPage("tDash.html")) {
    onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.exists() ? snap.data() : {};
        const $ = (id) => document.getElementById(id);
        if ($("tFirst")) $("tFirst").textContent = data.firstName || "—";
        if ($("tLast"))  $("tLast").textContent  = data.lastName  || "—";
        if ($("tEmail")) $("tEmail").textContent = data.email     || user.email || "—";
      } catch (e) {
        console.error("Failed to load teacher info", e);
      }
    });
  }

  // show/hide role-specific UI (optional)
  showElementsForRole();
});

// ---------- dashboard guards ----------
if (!(window.location.pathname.endsWith("stuDashboard.html") && window.location.search.includes("test=1"))) {
  requireRoleOn("stuDashboard.html", "student", "studentLogin.html");
}
if (!(window.location.pathname.endsWith("tDash.html") && window.location.search.includes("test=1"))) {
  requireRoleOn("tDash.html", "teacher", "teacherLogin.html");
}
if (!(window.location.pathname.endsWith("recRequest.html") && window.location.search.includes("test=1"))) {
  requireRoleOn("recRequest.html", "teacher", "teacherLogin.html");
}

// ---------- OPTIONAL: seed a real test teacher (run in console: seedTestTeacher()) ----------
window.seedTestTeacher = async function seedTestTeacher() {
  const email = "testteacher@gusd.net";
  const pass  = "Test!1234";
  const first = "Test";
  const last  = "Teacher";
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      role: "teacher",
      email,
      firstName: first,
      lastName: last,
      createdAt: serverTimestamp(),
    });
    console.log("✅ Seeded test teacher:", email);
  } catch (e) {
    if (e?.code === "auth/email-already-in-use") {
      console.log("ℹ️ Test teacher exists. Verifying profile…");
      // Sign in to ensure profile exists
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const ref = doc(db, "users", cred.user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          uid: cred.user.uid,
          role: "teacher",
          email,
          firstName: first,
          lastName: last,
          createdAt: serverTimestamp(),
        });
      }
      console.log("✅ Test teacher verified");
    } else {
      console.error("❌ Seed error:", e);
      alert(e?.message || "Seed failed");
    }
  } finally {
    // Sign out to avoid hijacking your session
    try { await signOut(auth); } catch {}
  }
};
