const studentButton = document.getElementById("studentBtn");
const teacherButton = document.getElementById("teacherBtn");
const  homeButtom= document.getElementById("homeBtn");

studentButton.addEventListener("click", () => {
  window.location.href = "studentLogin.html";
});

teacherButton.addEventListener("click", () => {
  window.location.href = "teacherLogin.html";
});
