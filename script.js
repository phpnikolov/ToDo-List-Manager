const taskList = document.getElementById("taskList");
const listOfLists = document.getElementById("listOfLists");

let currentListDate;

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function setCurrentDate(date) {
  currentListDate = date;
  document.getElementById("currentDate").textContent = formatDate(date);
}

function createTask() {
  const task = document.createElement("div");
  task.className = "task";
  task.draggable = true;
  task.innerHTML = `
        <div class="checkbox" onclick="toggleCheck(this)"></div>
        <input type="text">
    `;
  task.addEventListener("dragstart", dragStart);
  task.addEventListener("dragover", dragOver);
  task.addEventListener("drop", drop);
  task.addEventListener("dragenter", dragEnter);
  task.addEventListener("dragleave", dragLeave);
  taskList.appendChild(task);
}

function toggleCheck(checkbox) {
  checkbox.classList.toggle("checked");
}

function initTasks() {
  taskList.innerHTML = "";
  for (let i = 0; i < 20; i++) { // Increased number of tasks to fit more rows
    createTask();
  }
  setCurrentDate(new Date());
}

function updateSavedLists() {
  listOfLists.innerHTML = "";
  const keys = Object.keys(localStorage)
    .filter((key) => key.startsWith("todoList_"))
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 10);

  keys.forEach((key) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <span class="listDate" onclick="loadList('${key}')">${key.replace("todoList_", "")}</span>
            <span class="deleteBtn" onclick="deleteList('${key}')">X</span>
        `;
    listOfLists.appendChild(li);
  });
}

function saveList() {
  const tasks = Array.from(taskList.querySelectorAll(".task")).map((task) => {
    return {
      text: task.querySelector("input").value,
      checked: task.querySelector(".checkbox").classList.contains("checked")
    };
  });
  const saveData = { tasks: tasks, date: currentListDate };
  const saveDate = formatDate(currentListDate);
  localStorage.setItem(`todoList_${saveDate}`, JSON.stringify(saveData));
  updateSavedLists();
}

function loadList(key) {
  const savedData = JSON.parse(localStorage.getItem(key));
  if (savedData && savedData.tasks) {
    taskList.innerHTML = "";
    savedData.tasks.forEach((task, index) => {
      createTask();
      const taskElement = taskList.lastChild;
      taskElement.querySelector("input").value = task.text;
      if (task.checked) {
        taskElement.querySelector(".checkbox").classList.add("checked");
      }
    });
    setCurrentDate(new Date(savedData.date));
  }
}

function deleteList(key) {
  if (confirm("Are you sure you want to delete this list?")) {
    localStorage.removeItem(key);
    updateSavedLists();
  }
}

function printList() {
  window.print();
}

function newList() {
  if (confirm("Are you sure you want to start a new list? This will clear the current list.")) {
    initTasks();
  }
}

// Drag and Drop functionality
let draggedItem = null;

function dragStart(e) {
  draggedItem = this;
  setTimeout(() => this.classList.add("dragging"), 0);
}

function dragEnd(e) {
  this.classList.remove("dragging");
  draggedItem = null;
}

function dragOver(e) {
  e.preventDefault();
}

function dragEnter(e) {
  e.preventDefault();
  this.classList.add("drag-over");
}

function dragLeave(e) {
  this.classList.remove("drag-over");
}

function drop(e) {
  this.classList.remove("drag-over");
  if (this !== draggedItem) {
    let allTasks = Array.from(taskList.querySelectorAll(".task"));
    let indexDragged = allTasks.indexOf(draggedItem);
    let indexTarget = allTasks.indexOf(this);

    if (indexDragged < indexTarget) {
      taskList.insertBefore(draggedItem, this.nextSibling);
    } else {
      taskList.insertBefore(draggedItem, this);
    }
  }
}

function loadCurrentDateList() {
  const todayKey = `todoList_${formatDate(new Date())}`;
  if (localStorage.getItem(todayKey)) {
    loadList(todayKey);
  } else {
    initTasks();
  }
}

loadCurrentDateList();
updateSavedLists();

taskList.addEventListener("dragend", dragEnd);
