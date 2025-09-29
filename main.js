// --- Account Creation Logic ---
document.addEventListener('DOMContentLoaded', function() {
  // --- Teacher Login Logic ---
  if (window.location.pathname.endsWith('teacherLogin2.html')) {
    const submitBtn = document.querySelector('input[type="submit"]');
    if (submitBtn) {
      submitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const accessCode = document.getElementById('accod')?.value;
        const password = document.getElementById('Password')?.value;
        const username = document.getElementById('Tusername')?.value;
        if (accessCode !== '245867') {
          alert('Invalid access code.');
          return;
        }
        let teachers = JSON.parse(localStorage.getItem('teachers') || '{}');
        if (teachers[username] && teachers[username] === password) {
          window.location.href = 'tDash.html';
        } else {
          alert('Invalid teacher username or password.');
        }
      });
    }
  }
  const accountForm = document.getElementById('accountForm');
  if (accountForm) {
    accountForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const studentRadio = document.getElementById('studentRadio');
      const teacherRadio = document.getElementById('teacherRadio');
      if (studentRadio && studentRadio.checked) {
        const sid = document.getElementById('sid')?.value;
        let passwordInput = accountForm.querySelector('input#Spassword, input[name="Spassword"]');
        let password = passwordInput ? passwordInput.value : '';
        if (sid && password) {
          let users = JSON.parse(localStorage.getItem('students') || '{}');
          users[sid] = password;
          localStorage.setItem('students', JSON.stringify(users));
          alert('Account created! You can now log in.');
        } else {
          alert('Student ID and password required.');
        }
      } else if (teacherRadio && teacherRadio.checked) {
        // Teacher account creation
        const accessCode = document.getElementById('accessCode')?.value;
        if (accessCode !== '245867') {
          alert('Invalid access code for teachers.');
          return;
        }
        // Get teacher username and password
        const tusername = document.getElementById('Tusername')?.value;
        let tpasswordInput = accountForm.querySelector('input#Tpassword, input[name="Tpassword"]');
        let tpassword = tpasswordInput ? tpasswordInput.value : '';
        if (tusername && tpassword) {
          let teachers = JSON.parse(localStorage.getItem('teachers') || '{}');
          teachers[tusername] = tpassword;
          localStorage.setItem('teachers', JSON.stringify(teachers));
          alert('Teacher account created! You can now log in.');
        } else {
          alert('Teacher username and password required.');
        }
      }
    });
  }

  // --- Student Login Logic ---
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
// Role selection logic for create account form
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
    window.location.href = "teacherLogin2.html";
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
  opButton.addEventListener("click", () => {
    window.location.href = "stuDashboard.html";
  });
}

const poobtn = document.getElementById("test2");
if (poobtn) {
  poobtn.addEventListener("click", () => {
    window.location.href = "stuDashboard.html";
  });
}

const pooBtn = document.getElementById("test2");
if (pooBtn) {
  pooBtn.addEventListener("click", () => {
    window.location.href = "tDash.html";
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


