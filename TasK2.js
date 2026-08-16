// State Management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editId = null;

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskCategory = document.getElementById('task-category');
const taskPriority = document.getElementById('task-priority');
const taskDueDate = document.getElementById('task-due-date');
const taskList = document.getElementById('task-list');
const themeToggle = document.getElementById('theme-toggle');

// Filter & Stat Elements
const searchInput = document.getElementById('search-input');
const filterStatus = document.getElementById('filter-status');
const filterPriority = document.getElementById('filter-priority');
const pendingCount = document.getElementById('pending-count');
const completedCount = document.getElementById('completed-count');

// Initialize App
function init() {
    initTheme();
    renderTasks();
    setupEventListeners();
}

function setupEventListeners() {
    taskForm.addEventListener('submit', handleTaskSubmit);
    searchInput.addEventListener('input', renderTasks);
    filterStatus.addEventListener('change', renderTasks);
    filterPriority.addEventListener('change', renderTasks);
    themeToggle.addEventListener('click', toggleTheme);
}

// Core Operations
function handleTaskSubmit(e) {
    e.preventDefault();
    
    const title = taskInput.value.trim();
    if (!title) return alert('Task description cannot be empty!');

    const newTask = {
        id: editId || Date.now().toString(),
        title,
        category: taskCategory.value,
        priority: taskPriority.value,
        dueDate: taskDueDate.value,
        completed: editId ? tasks.find(t => t.id === editId).completed : false,
        createdAt: new Date().toISOString()
    };

    if (editId) {
        tasks = tasks.map(t => t.id === editId ? newTask : t);
        editId = null;
        document.getElementById('add-btn').textContent = 'Add Task';
    } else {
        tasks.unshift(newTask);
    }

    saveAndRender();
    taskForm.reset();
    taskPriority.value = 'Medium'; // reset default
}

function toggleStatus(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveAndRender();
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveAndRender();
    }
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editId = id;
    taskInput.value = task.title;
    taskCategory.value = task.category;
    taskPriority.value = task.priority;
    taskDueDate.value = task.dueDate;
    
    document.getElementById('add-btn').textContent = 'Update Task';
    taskInput.focus();
}

// UI & Rendering
function renderTasks() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilter = filterStatus.value;
    const priorityFilter = filterPriority.value;

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'All' ? true : 
                              statusFilter === 'Completed' ? task.completed : !task.completed;
        const matchesPriority = priorityFilter === 'All' ? true : task.priority === priorityFilter;
        
        return matchesSearch && matchesStatus && matchesPriority;
    });

    taskList.innerHTML = '';

    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<p style="text-align:center; color:var(--text-muted)">No tasks found.</p>';
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        const formattedDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date';

        li.innerHTML = `
            <div class="task-header">
                <span class="task-title">${task.title}</span>
                <div class="task-actions">
                    <button class="btn-toggle" onclick="toggleStatus('${task.id}')">
                        ${task.completed ? '↺ Undo' : '✓ Done'}
                    </button>
                    <button class="btn-edit" onclick="editTask('${task.id}')">✎ Edit</button>
                    <button class="btn-delete" onclick="deleteTask('${task.id}')">✗ Del</button>
                </div>
            </div>
            <div class="task-meta">
                <span class="badge">📁 ${task.category}</span>
                <span class="badge priority-${task.priority}">⚡ ${task.priority}</span>
                <span class="badge">📅 ${formattedDate}</span>
            </div>
        `;
        taskList.appendChild(li);
    });

    updateStats();
}

function updateStats() {
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.length - completed;
    
    completedCount.textContent = completed;
    pendingCount.textContent = pending;
}

function saveAndRender() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

// Boot up
init();