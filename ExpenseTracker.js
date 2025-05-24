const form = document.getElementById('expense-form');
const descInput = document.getElementById('desc');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const expenseList = document.getElementById('expense-list');
const totalSpan = document.getElementById('total');
const monthSpan = document.getElementById('month');
const pieChart = document.getElementById('pie-chart');

const CATEGORY_COLORS = [
  "#f87171", // Food
  "#fbbf24", // Books
  "#34d399", // Travel
  "#60a5fa", // Entertainment
  "#a78bfa", // Other
  "#f472b6"  // Extra (if needed)
];

let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
let editingId = null;

function saveExpenses() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

function renderExpenses() {
  expenseList.innerHTML = '';
  expenses.forEach((exp, idx) => {
    const li = document.createElement('li');
    li.className = 'expense-item';

    const info = document.createElement('div');
    info.className = 'expense-info';
    info.innerHTML = `
      <span class="expense-desc">${exp.desc}</span>
      <span class="expense-meta">${exp.date}</span>
    `;

    const amt = document.createElement('span');
    amt.className = 'expense-amt';
    amt.textContent = `₹${exp.amount}`;

    const cat = document.createElement('span');
    cat.className = 'expense-category';
    cat.style.background = getCategoryGradient(exp.category);
    cat.textContent = exp.category;

    const actions = document.createElement('div');
    actions.className = 'expense-actions';
    actions.innerHTML = `
      <button title="Edit" onclick="editExpense(${idx})">✏️</button>
      <button title="Delete" onclick="deleteExpense(${idx})">🗑️</button>
    `;

    li.appendChild(info);
    li.appendChild(amt);
    li.appendChild(cat);
    li.appendChild(actions);
    expenseList.appendChild(li);
  });
}

function renderSummary() {
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  totalSpan.textContent = `₹${total}`;
  const now = new Date();
  const thisMonth = expenses.filter(e => {
    const d = new Date(e.rawDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((sum, e) => sum + Number(e.amount), 0);
  monthSpan.textContent = `₹${thisMonth}`;
}

function renderPieChart() {
  if (!expenses.length) {
    pieChart.style.background = "conic-gradient(#e0e7ef 0% 100%)";
    return;
  }
  const cats = ["Food","Books","Travel","Entertainment","Other"];
  let sums = cats.map(cat => expenses.filter(e=>e.category===cat).reduce((a,e)=>a+Number(e.amount),0));
  let total = sums.reduce((a,b)=>a+b,0);
  let degs = sums.map(s => s/total*360);

  let stops = [];
  let last = 0;
  for (let i=0;i<cats.length;i++) {
    let color = CATEGORY_COLORS[i];
    stops.push(`${color} ${last}deg ${(last+degs[i])}deg`);
    last += degs[i];
  }
  pieChart.style.background = `conic-gradient(${stops.join(',')})`;
}

function getCategoryGradient(cat) {
  switch(cat) {
    case "Food": return "linear-gradient(90deg,#f87171,#fbbf24)";
    case "Books": return "linear-gradient(90deg,#fbbf24,#34d399)";
    case "Travel": return "linear-gradient(90deg,#34d399,#60a5fa)";
    case "Entertainment": return "linear-gradient(90deg,#60a5fa,#a78bfa)";
    default: return "linear-gradient(90deg,#a78bfa,#f472b6)";
  }
}

function resetForm() {
  form.reset();
  editingId = null;
  form.querySelector('button[type="submit"]').textContent = "Add";
}

window.editExpense = function(idx) {
  const exp = expenses[idx];
  descInput.value = exp.desc;
  amountInput.value = exp.amount;
  categoryInput.value = exp.category;
  editingId = idx;
  form.querySelector('button[type="submit"]').textContent = "Update";
}

window.deleteExpense = function(idx) {
  if (confirm("Delete this expense?")) {
    expenses.splice(idx,1);
    saveExpenses();
    render();
  }
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const desc = descInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  if (!desc || !amount || !category) return;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' });
  const expObj = {
    desc,
    amount,
    category,
    date: dateStr,
    rawDate: now.toISOString()
  };

  if (editingId !== null) {
    expenses[editingId] = expObj;
  } else {
    expenses.unshift(expObj);
  }
  saveExpenses();
  render();
  resetForm();
});

function render() {
  renderExpenses();
  renderSummary();
  renderPieChart();
}

render();

