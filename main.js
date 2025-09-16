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
  opButton.addEventListener("click", () => {
    window.location.href = "studentMain.html";
  });
}

