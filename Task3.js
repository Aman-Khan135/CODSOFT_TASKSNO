// DOM Elements
const balanceEl = document.getElementById('balance');
const incomeTotalEl = document.getElementById('income-total');
const expenseTotalEl = document.getElementById('expense-total');
const listEl = document.getElementById('transaction-list');
const form = document.getElementById('transaction-form');
const typeEl = document.getElementById('type');
const descEl = document.getElementById('desc');
const amountEl = document.getElementById('amount');
const categoryEl = document.getElementById('category');
const dateEl = document.getElementById('date');
const filterEl = document.getElementById('filter-category');
const submitBtn = document.getElementById('submit-btn');
const formTitle = document.getElementById('form-title');

// Local Storage & State
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let isEditing = false;
let editId = null;

// Generate Random ID
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// Add or Update Transaction
function addTransaction(e) {
    e.preventDefault();

    const type = typeEl.value;
    const desc = descEl.value.trim();
    const amount = +amountEl.value;
    const category = categoryEl.value;
    const date = dateEl.value;

    if (desc === '' || isNaN(amount) || amount <= 0 || date === '') {
        alert('Please fill out all fields with valid information.');
        return;
    }

    if (isEditing) {
        // Update existing transaction
        transactions = transactions.map(t => 
            t.id === editId ? { id: editId, type, desc, amount, category, date } : t
        );
        isEditing = false;
        editId = null;
        submitBtn.innerText = 'Add Transaction';
        formTitle.innerText = 'Add New Transaction';
    } else {
        // Create new transaction
        const transaction = {
            id: generateID(),
            type,
            desc,
            amount,
            category,
            date
        };
        transactions.push(transaction);
    }

    updateLocalStorage();
    init();
    form.reset();
    
    // Set default date to today after reset
    document.getElementById('date').valueAsDate = new Date();
}

// Render Transactions into DOM
function renderTransactions(filterCategory = 'All') {
    listEl.innerHTML = '';

    const filteredTransactions = filterCategory === 'All' 
        ? transactions 
        : transactions.filter(t => t.category === filterCategory);

    filteredTransactions.forEach(transaction => {
        const cssClass = transaction.type === 'income' ? 'inc' : 'exp';
        const sign = transaction.type === 'income' ? '+' : '-';
        
        const li = document.createElement('li');
        li.classList.add(cssClass);

        li.innerHTML = `
            <div class="transaction-info">
                <span class="title">${transaction.desc}</span>
                <span class="meta">${transaction.date} | ${transaction.category}</span>
            </div>
            <div class="transaction-actions">
                <span class="transaction-amount">${sign}$${transaction.amount.toFixed(2)}</span>
                <div class="action-btns">
                    <button class="edit-btn" onclick="editTransaction(${transaction.id})">Edit</button>
                    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">Del</button>
                </div>
            </div>
        `;

        listEl.appendChild(li);
    });
}

// Update Balance, Income, and Expense summaries
function updateValues() {
    const amounts = transactions.map(t => t.type === 'income' ? t.amount : -t.amount);
    
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    
    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2);
        
    const expense = (amounts
        .filter(item => item < 0)
        .reduce((acc, item) => (acc += item), 0) * -1)
        .toFixed(2);

    balanceEl.innerText = `$${total}`;
    incomeTotalEl.innerText = `+$${income}`;
    expenseTotalEl.innerText = `-$${expense}`;
}

// Remove Transaction
function removeTransaction(id) {
    if(confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(transaction => transaction.id !== id);
        updateLocalStorage();
        init();
    }
}

// Edit Transaction
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    // Populate form
    typeEl.value = transaction.type;
    descEl.value = transaction.desc;
    amountEl.value = transaction.amount;
    categoryEl.value = transaction.category;
    dateEl.value = transaction.date;

    isEditing = true;
    editId = id;
    
    submitBtn.innerText = 'Update Transaction';
    formTitle.innerText = 'Edit Transaction';
    
    // Scroll to form (helpful on mobile)
    form.scrollIntoView({ behavior: 'smooth' });
}

// Update Local Storage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Initialize App
function init() {
    const currentFilter = filterEl.value;
    renderTransactions(currentFilter);
    updateValues();
}

// Event Listeners
form.addEventListener('submit', addTransaction);
filterEl.addEventListener('change', (e) => {
    renderTransactions(e.target.value);
});

// Set default date input to today on load
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('date').valueAsDate = new Date();
    init();
});