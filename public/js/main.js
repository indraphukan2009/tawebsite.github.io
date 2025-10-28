// public/js/main.js
// ---------- imports ----------
import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// ---------- helpers ----------
const onPage = (name) =>
  window.location.pathname.toLowerCase().endsWith(name.toLowerCase());

function requireRoleOn(pageFile, role, redirectTo) {
  if (!onPage(pageFile)) return;
  onAuthStateChanged(auth, async (user) => {
    if (!user) return (window.location.href = redirectTo);
    try {
      // Firestore-backed role check (Spark plan, no custom claims)
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.exists() ? snap.data() : null;

      if (role === "student" && data?.role === "student") return;
      if (role === "teacher" && data?.role === "teacher") return;

      window.location.href = redirectTo;
    } catch (e) {
      console.error("role check failed", e);
      window.location.href = redirectTo;
    }
  });
}

async function getUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error("profile load failed", e);
    return null;
  }
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

  // Teacher test shortcut (poo button) -> always jump to tDash (dev only)
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
  if (studentButton)
    studentButton.addEventListener("click", () => (window.location.href = "studentLogin.html"));

  const teacherButton = document.getElementById("teacherBtn");
  if (teacherButton)
    teacherButton.addEventListener("click", () => (window.location.href = "teacherLogin.html"));

  const homeButton = document.getElementById("homeBtn");
  if (homeButton)
    homeButton.addEventListener("click", () => (window.location.href = "index.html"));

  const formBtn = document.getElementById("formBtn");
  if (formBtn)
    formBtn.addEventListener("click", () => (window.location.href = "submitForm.html"));

  const recButton = document.getElementById("recBtn");
  if (recButton)
    recButton.addEventListener("click", () => (window.location.href = "requestRec.html"));

  const back = document.getElementById("dash");
  if (back)
    back.addEventListener("click", () => (window.location.href = "stuDashboard.html"));

  const talog = document.getElementById("taLog");
  if (talog)
    talog.addEventListener("click", () => (window.location.href = "talog.html"));

  // Fix typo: tReq should go to recRequest.html
  const tReq = document.getElementById("tReq");
  if (tReq)
    tReq.addEventListener("click", () => (window.location.href = "recRequest.html"));

  const opButton = document.getElementById("teachBtn");
  if (opButton)
    opButton.addEventListener("click", (e) => {
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
          // --- Student signup ---
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
          // --- Teacher signup (Spark plan: email verification + domain rules) ---
          const email = document.getElementById("Tusername")?.value?.trim();
          const password = document.getElementById("Tpassword")?.value;
          if (!email || !password) return alert("Teacher email and password required.");

          const cred = await createUserWithEmailAndPassword(auth, email, password);

          // Create profile WITHOUT role (rules prevent client from setting teacher at create)
          await setDoc(
            doc(db, "users", cred.user.uid),
            {
              uid: cred.user.uid,
              email,
              lastName: document.getElementById("TLastName")?.value?.trim() || "",
              createdAt: Date.now(),
            },
            { merge: true }
          );

          // Send verification email; teacher must verify before promotion
          try {
            await sendEmailVerification(cred.user);
            alert("Verification email sent. Please verify your email, then log in on the Teacher Login page.");
          } catch (ve) {
            console.warn("sendEmailVerification failed", ve);
            alert("Could not send verification email. You can still verify from your account later.");
          }
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
            document.getElementById("Susername")?.value?.trim() ||
            document.getElementById("email")?.value?.trim() ||
            "";
          const password =
            document.getElementById("Spassword")?.value ||
            document.getElementById("Password")?.value ||
            "";
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
          const email = (document.getElementById("Tusername")?.value || "").trim();
          const password =
            document.getElementById("Tpassword")?.value ||
            document.getElementById("Password")?.value ||
            "";
          if (!email || !password) return alert("Teacher email and password required.");

          // Sign in first
          const cred = await signInWithEmailAndPassword(auth, email, password);

          // Refresh the user to get the latest emailVerified flag
          await cred.user.reload();

          if (!cred.user.emailVerified) {
            alert("Please verify your email first (check your inbox), then try again.");
            return;
          }

          // Try to elevate role to teacher (rules enforce @gusd.net + verified)
          try {
            await setDoc(doc(db, "users", cred.user.uid), { role: "teacher" }, { merge: true });
          } catch (werr) {
            // If rules reject, the message explains why.
            console.warn("Role set rejected by rules:", werr);
            alert("Could not set teacher role. Make sure your email is verified and ends with @gusd.net.");
            return;
          }

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
// Populate a welcome message on dashboards with the signed-in user's name
document.addEventListener('DOMContentLoaded', async () => {
  const welcomeEl = document.getElementById('welcomeMsg');
  if (!welcomeEl) return;
  try {
    const profile = await getUserProfile();
    let name = 'User';
    if (profile) {
      // Prefer first + last name when available
      const first = (profile.firstName || '').trim();
      const last = (profile.lastName || '').trim();
      if (first || last) {
        name = (first + ' ' + last).trim();
      } else if (profile.email) {
        // fallback to the email local-part
        name = profile.email.split('@')[0];
      }
    }
    welcomeEl.textContent = `Welcome, ${name}`;
  } catch (e) {
    console.error('Failed to load profile for welcome message', e);
  }
});

// ---- universal submit safety net ----
document.addEventListener("click", (e) => {
  const btn = e.target.closest('input[type="submit"], button[type="submit"]');
  if (!btn) return;

  const form = btn.form || btn.closest("form");
  if (!form) {
    console.warn("Submit clicked but no <form> found for:", btn);
    return;
  }

  e.preventDefault();
  form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
});
