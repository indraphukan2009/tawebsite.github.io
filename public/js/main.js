// Firebase imports for auth + database
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

if (window.location.pathname.endsWith('teacherLogin.html')) {
  const pooBtn = document.getElementById('test2');
  if (pooBtn) {
    pooBtn.addEventListener('click', function() {
      window.location.href = 'tDash.html';
    });
  }
}

// global sign out handler (works on any page where #signOutBtn exists)
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("#signOutBtn");
  if (!btn) return;
  try {
    await signOut(auth);
    // send users back to the homepage after sign out
    window.location.href = "index.html";
  } catch (err) {
    console.error(err);
    alert(err.message || "Sign out failed.");
  }
});

// Fetch the signed-in user's profile (from Firestore)
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
// ---- role guard helpers ----
function requireRoleOn(pageFile, role, redirectTo) {
  if (window.location.pathname.toLowerCase().endsWith(pageFile.toLowerCase())) {
    onAuthStateChanged(auth, async (user) => {
      if (!user) return (window.location.href = redirectTo); // not signed in
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.exists() ? snap.data() : null;
        if (!data || data.role !== role) {
          // wrong role -> bounce to appropriate login
          window.location.href = redirectTo;
        }
      } catch (e) {
        console.error("role check failed", e);
        window.location.href = redirectTo;
      }
    });
  }
}

// Student dashboard must be a student
requireRoleOn("stuDashboard.html", "student", "studentLogin.html");

// Teacher dashboard must be a teacher
requireRoleOn("tDash.html", "teacher", "teacherLogin.html");

// ---- show/hide UI elements by role ----
async function showElementsForRole() {
  const profile = await getUserProfile();
  if (!profile) return;

  // elements tagged with data-role="student" or "teacher"
  document.querySelectorAll("[data-role]").forEach((el) => {
    const role = el.getAttribute("data-role");
    el.style.display = profile.role === role ? "block" : "none";
  });
}

// run this on pages that both roles can access
showElementsForRole();

// ==== STUDENT LOGIN via Firebase (studentLogin.html) ====
if (window.location.pathname.toLowerCase().endsWith("studentlogin.html")) {
  // Handle form submit
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        // Use student email + password fields (fallbacks included)
        const email =
          document.getElementById("email")?.value?.trim() ||
          document.getElementById("Susername")?.value?.trim() || // if you had this
          "";
        const password =
          document.getElementById("Password")?.value ||
          document.getElementById("Spassword")?.value ||
          "";

        if (!email || !password) return alert("Email and password are required.");

        await signInWithEmailAndPassword(auth, email, password);
        // success → go to dashboard
        window.location.href = "stuDashboard.html";
      } catch (err) {
        console.error(err);
        alert(err.message || "Student sign-in failed.");
      }
    });
  }

  // Also catch any “Login” button clicks
  document.querySelectorAll("button, input[type=submit]").forEach((btn) => {
    const label = (btn.value || btn.innerText || "").toLowerCase();
    if (/log\s*in|sign\s*in/.test(label) || (btn.id || "").toLowerCase().includes("login")) {
      btn.addEventListener("click", (e) => {
        // Let the form submit handler above run
      });
    }
  });
}

                           
document.addEventListener('DOMContentLoaded', function() {

  if (window.location.pathname.endsWith('teacherLogin.html')) {
    const submitBtn = document.querySelector('input[type="submit"]');
    if (submitBtn) {
      submitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const accessCode = document.getElementById('accod')?.value;
        const password = document.getElementById('Password')?.value;
        const username = document.getElementById('Tusername')?.value;
        let teachers = JSON.parse(localStorage.getItem('teachers') || '{}');
        let errors = [];
        if (!username) errors.push('Username (GUSD Email) is required.');
        if (!password) errors.push('Password is required.');
        if (!accessCode) errors.push('Access code is required.');
        if (accessCode && accessCode !== '245867') errors.push('Access code is invalid.');
        if (username && password && accessCode === '245867' && !(teachers[username] && teachers[username] === password)) {
          errors.push('Username or password is incorrect.');
        }
        if (errors.length > 0) {
          alert(errors.join('\n'));
        } else {
          window.location.href = 'tDash.html';
        }
      });
    }
    // Fix: Add event listener for 'poo' button inside DOMContentLoaded
    const pooBtn = document.getElementById('test2');
    if (pooBtn) {
      pooBtn.addEventListener('click', function() {
        window.location.href = 'tDash.html';
      });
    }
  }
  // CREATE ACCOUNT with Firebase (index.html)
const accountForm = document.getElementById("accountForm");
if (accountForm) {
  accountForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const studentRadio = document.getElementById("studentRadio");
    const teacherRadio = document.getElementById("teacherRadio");

    try {
      if (studentRadio?.checked) {
        // STUDENT SIGN UP
        const email = document.getElementById("email")?.value?.trim();
        const password = document.getElementById("Spassword")?.value;

        if (!email || !password) return alert("Student email and password required.");

        // 1) Create auth user
        const cred = await createUserWithEmailAndPassword(auth, email, password);

        // 2) Save profile in Firestore
        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          role: "student",
          email,
          firstName: document.getElementById("fname")?.value?.trim() || "",
          lastName: document.getElementById("lname")?.value?.trim() || "",
          sid: document.getElementById("sid")?.value?.trim() || "",
          classOf: document.getElementById("clsof")?.value?.trim() || "",
          createdAt: Date.now()
        });

        alert("Student account created! You can now log in.");
      } else if (teacherRadio?.checked) {
        // TEACHER SIGN UP
        const accessCode = document.getElementById("accessCode")?.value || "";
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
          createdAt: Date.now()
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



  if (window.location.pathname.endsWith('studentLogin.html')) {
    const submitBtn = document.querySelector('input[type="submit"]');
    if (submitBtn) {
      submitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const sid = document.getElementById('sid')?.value;
        const password = document.getElementById('Password')?.value;
        let users = JSON.parse(localStorage.getItem('students') || '{}');
        if (sid && password && users[sid] === password) {
          // Successful login
          window.location.href = 'stuDashboard.html';
        } else {
          alert('Invalid Student ID or password.');
        }
      });
    }
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const studentRadio = document.getElementById('studentRadio');
  const teacherRadio = document.getElementById('teacherRadio');
  const teacherAccess = document.getElementById('teacherAccess');
  const studentFields = document.getElementById('studentFields');

  if (studentRadio && teacherRadio && teacherAccess && studentFields) {
    function updateForm() {
      if (teacherRadio.checked) {
        teacherAccess.style.display = 'block';
        studentFields.style.display = 'none';
      } else {
        teacherAccess.style.display = 'none';
        studentFields.style.display = 'block';
      }
    }
    studentRadio.addEventListener('change', updateForm);
    teacherRadio.addEventListener('change', updateForm);
    updateForm();
  }
});

const studentButton = document.getElementById("studentBtn");
if (studentButton) {
  studentButton.addEventListener("click", () => {
    window.location.href = "studentLogin.html";
  });
}

const teacherButton = document.getElementById("teacherBtn");
if (teacherButton) {
  teacherButton.addEventListener("click", () => {
    window.location.href = "teacherLogin.html";
  });
}

const homeButton = document.getElementById("homeBtn");
if (homeButton) {
  homeButton.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

const opButton = document.getElementById("teachBtn");
if (opButton) {
  opButton.addEventListener("click", (e) => {
    // prevent any default (submit/navigation) behavior so we don't briefly reload the
    // current page before our client-side navigation runs
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    window.location.href = "stuDashboard.html";
  });
}

const pooBtn = document.getElementById('test2');
if (pooBtn) {
  pooBtn.addEventListener('click', (e) => {
    // stop default behavior (sometimes inputs/buttons can trigger a form submit/refresh)
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    window.location.href = 'tDash.html';
  });
}

const recButton = document.getElementById("recBtn");
if (recButton) {
  recButton.addEventListener("click", () => {
    window.location.href = "requestRec.html";
  });
}

const formBtn = document.getElementById("formBtn");
if (formBtn) {
  formBtn.addEventListener("click", () => {
    window.location.href = "submitForm.html";
  });
}

const back = document.getElementById("dash");
if (back) {
  back.addEventListener("click", () => {
    window.location.href = "stuDashboard.html";
  });
}

const rambo = document.getElementById("tReq");
if (rambo) {
  rambo.addEventListener("click", () => {
    window.location.href = "reqRequest";
  });
}

const talog = document.getElementById("taLog");
if (talog) {
  talog.addEventListener("click", () => {
    window.location.href = "talog.html";
  });
}


