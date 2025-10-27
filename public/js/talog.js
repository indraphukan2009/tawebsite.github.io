// Example placeholder data
const students = [
  {
    name: "Emma Park",
    grade: "11",
    description: "I like to eat and do math — I’m good at tutoring geometry, algebra, and trig. Available after school.",
    teacherReqs: "Mr. Poole: good student",
    assigned: true,
    teacher: "Mr. Poole"
  },
  {
    name: "Liam Chen",
    grade: "10",
    description: "Enjoys helping with robotics and programming. Can assist in Java and Python basics.",
    teacherReqs: "Ms. Patel: needs extra support",
    assigned: false,
    teacher: ""
  }
];

function createExpandableCell(content) {
  const cell = document.createElement("td");
  cell.classList.add("expandable");

  const shortText = content.length > 45 ? content.substring(0, 45) + "..." : content;
  const fullText = content;
  let expanded = false;
  cell.textContent = shortText;

  cell.addEventListener("click", () => {
    expanded = !expanded;
    cell.classList.toggle("expanded");
    cell.textContent = expanded ? fullText : shortText;
  });

  return cell;
}

function renderTable() {
  const tableBody = document.querySelector("#taLogTable tbody");
  tableBody.innerHTML = "";

  students.forEach(student => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = student.name;

    const gradeCell = document.createElement("td");
    gradeCell.textContent = student.grade;

    const descCell = createExpandableCell(student.description || "");
    const reqCell = createExpandableCell(student.teacherReqs || "");

    const assignedCell = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = student.assigned;
    assignedCell.appendChild(checkbox);

    const teacherCell = document.createElement("td");
    teacherCell.textContent = student.teacher || "";

    row.append(nameCell, gradeCell, descCell, reqCell, assignedCell, teacherCell);
    tableBody.appendChild(row);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderTable();

  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      // change to whatever page you want “Back” to go to:
      window.location.href = "tDash.html"; 
    });
  }
});
