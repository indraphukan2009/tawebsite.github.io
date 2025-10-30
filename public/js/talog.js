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
  },
  {
    name: "Sofia Martinez",
    grade: "12",
    description: "Strong in AP Biology and Chemistry; likes working one-on-one with underclassmen who need science help.",
    teacherReqs: "Mr. Davis: excellent lab skills",
    assigned: true,
    teacher: "Mr. Davis"
  },
  {
    name: "Aiden Lee",
    grade: "11",
    description: "Patient and reliable, helps peers in Algebra 2 and Precalculus. Available most lunches.",
    teacherReqs: "Ms. Alva: responsible and consistent",
    assigned: true,
    teacher: "Ms. Alva"
  },
  {
    name: "Ethan Lee",
    grade: "12",
    description: "Super hardworking and smart",
    teacherReqs: "Ms. Poole: good kid",
    assigned: false,
    teacher: ""
  },
  {
    name: "Noah Johnson",
    grade: "12",
    description: "AP Physics 2 student; enjoys building small electronics and assisting with lab setups.",
    teacherReqs: "Mr. Chang: dependable and curious",
    assigned: true,
    teacher: "Mr. Chang"
  },
  {
    name: "Olivia Kim",
    grade: "10",
    description: "Strong writer; can proofread essays or help with grammar corrections in English classes.",
    teacherReqs: "Ms. Beerman: great with detail and editing",
    assigned: false,
    teacher: ""
  },
  {
    name: "Ethan Patel",
    grade: "11",
    description: "Excels in AP Computer Science and loves debugging. Can support students in the CS lab.",
    teacherReqs: "Mr. Ross: strong technical background",
    assigned: true,
    teacher: "Mr. Ross"
  },
  {
    name: "Grace Thompson",
    grade: "9",
    description: "Very social and empathetic; good with new students and front office communication.",
    teacherReqs: "Ms. Forbes: polite and professional demeanor",
    assigned: false,
    teacher: ""
  },
  {
    name: "Daniel Rivera",
    grade: "12",
    description: "Has taken three years of Spanish; can help translate for newcomers and organize handouts.",
    teacherReqs: "Ms. Hernandez: fluent and cooperative",
    assigned: true,
    teacher: "Ms. Hernandez"
  },
  {
    name: "Isabella Morales",
    grade: "10",
    description: "Interested in psychology; good listener and calm under pressure. Wants to help with peer tutoring.",
    teacherReqs: "Mr. Song: empathetic and observant",
    assigned: false,
    teacher: ""
  },
  {
    name: "Joshua White",
    grade: "11",
    description: "Skilled at using spreadsheets; can help teachers track attendance and assignments efficiently.",
    teacherReqs: "Mr. Smith: tech-savvy and dependable",
    assigned: true,
    teacher: "Mr. Smith"
  }
];

// --- existing code unchanged below ---

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
      window.location.href = "tDash.html"; 
    });
  }
});
