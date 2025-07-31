document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.querySelector("input[type='text']");
  const dueInput = document.querySelector(".schedule-date");
  const addButton = document.querySelector(".add-task-button");
  const searchInput = document.querySelector(".search-input");
  const prioritySelect = document.querySelector(".priority-select");
  const todoBody = document.querySelector(".todos-list-body");
  const totalCounter = document.querySelector(".total-counter");
  const completedCounter = document.querySelector(".completed-counter");
  const pendingCounter = document.querySelector(".pending-counter");
  const percentageDisplay = document.querySelector(".percentage-display");
  const progressBar = document.querySelector(".progress-bar");
  const alertBox = document.querySelector(".alert-message");
  const deleteAllBtn = document.querySelector(".delete-all-btn");
  const themeItems = document.querySelectorAll(".theme-item");
  const html = document.querySelector("html");
  const emptyState = document.querySelector(".empty-state");

  let todos = JSON.parse(localStorage.getItem("todos")) || [];
  let isEditing = false;
  let editingId = null;

  function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos));
  }

  function renderTodos() {
    todoBody.innerHTML = "";
    if (todos.length === 0) {
      emptyState.classList.remove("hidden");
    } else {
      emptyState.classList.add("hidden");
    }

    todos.forEach((todo) => {
      const tr = document.createElement("tr");
      tr.className = "todo-item";
      tr.innerHTML = `
        <td>${todo.task}</td>
        <td>${todo.due || "No due date"}</td>
        <td>
          <span class="priority-badge ${getPriorityClass(todo.priority)}">
            ${getPriorityLabel(todo.priority)}
          </span>
        </td>
        <td>
          <button class="btn btn-xs btn-warning edit" data-id="${todo.id}">
            <i class="bx bx-edit"></i>
          </button>
          <button class="btn btn-xs btn-success toggle" data-id="${todo.id}">
            <i class="bx ${todo.done ? "bx-x" : "bx-check"}"></i>
          </button>
          <button class="btn btn-xs btn-error delete" data-id="${todo.id}">
            <i class="bx bx-trash"></i>
          </button>
        </td>
      `;
      if (todo.done) {
        tr.classList.add("opacity-60");
        tr.querySelector("td:first-child").classList.add("line-through");
      }
      todoBody.appendChild(tr);
    });

    updateStats();
  }

  function updateStats() {
    const total = todos.length;
    const completed = todos.filter((t) => t.done).length;
    const pending = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    totalCounter.textContent = total;
    completedCounter.textContent = completed;
    pendingCounter.textContent = pending;
    percentageDisplay.textContent = `${percent}%`;
    progressBar.style.width = `${percent}%`;
  }

  function getPriorityClass(level) {
    return ["priority-low", "priority-medium", "priority-high"][level] || "";
  }

  function getPriorityLabel(level) {
    return ["Low", "Medium", "High"][level] || "Low";
  }

  function showAlert(msg, type = "info") {
    alertBox.innerHTML = `
      <div class="alert alert-${type}">
        <i class="bx ${
          type === "success"
            ? "bx-check-circle"
            : type === "error"
            ? "bx-error-circle"
            : "bx-info-circle"
        } bx-sm"></i>
        <span>${msg}</span>
      </div>
    `;
    alertBox.classList.add("show");
    setTimeout(() => alertBox.classList.remove("show"), 3000);
  }

  function resetForm() {
    taskInput.value = "";
    dueInput.value = "";
    prioritySelect.value = "0";
    isEditing = false;
    editingId = null;
    addButton.innerHTML = `<i class="bx bx-plus bx-sm"></i>`;
    taskInput.placeholder = "Add a todo . . .";
  }

  addButton.addEventListener("click", () => {
    const task = taskInput.value.trim();
    const due = dueInput.value;
    const priority = parseInt(prioritySelect.value);

    if (!task) return showAlert("Enter a task", "error");

    if (isEditing && editingId) {
      const idx = todos.findIndex((t) => t.id === editingId);
      if (idx !== -1) {
        todos[idx].task = task;
        todos[idx].due = due;
        todos[idx].priority = priority;
        showAlert("Task updated", "success");
      }
    } else {
      todos.push({
        id: Date.now().toString(),
        task,
        due,
        priority,
        done: false,
      });
      showAlert("Task added", "success");
    }

    saveTodos();
    renderTodos();
    resetForm();
  });

  todoBody.addEventListener("click", (e) => {
    const id = e.target.closest("button")?.dataset.id;
    if (!id) return;
    const idx = todos.findIndex((t) => t.id === id);
    if (idx === -1) return;

    if (e.target.closest(".delete")) {
      todos.splice(idx, 1);
      showAlert("Task deleted", "success");
    } else if (e.target.closest(".toggle")) {
      todos[idx].done = !todos[idx].done;
    } else if (e.target.closest(".edit")) {
      isEditing = true;
      editingId = id;
      const todo = todos[idx];
      taskInput.value = todo.task;
      dueInput.value = todo.due;
      prioritySelect.value = todo.priority;
      taskInput.placeholder = "✏️ Editing task...";
      addButton.innerHTML = `<i class="bx bx-check bx-sm"></i>`;
    }

    saveTodos();
    renderTodos();
  });

  deleteAllBtn.addEventListener("click", () => {
    if (confirm("Delete all tasks?")) {
      todos = [];
      saveTodos();
      renderTodos();
      showAlert("All tasks cleared", "info");
    }
  });

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    document.querySelectorAll(".todo-item").forEach((row) => {
      const taskText = row.children[0].textContent.toLowerCase();
      row.style.display = taskText.includes(query) ? "" : "none";
    });
  });

  themeItems.forEach((item) => {
    item.addEventListener("click", () => {
      const theme = item.getAttribute("theme");
      html.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    });
  });

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) html.setAttribute("data-theme", savedTheme);

  // Init
  renderTodos();
});
