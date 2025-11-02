// Expense Tracker JavaScript
// Handles expense logging, Chart.js rendering, and notifications

let expenses = [];
let expenseChart = null;
const monthlyBudget = 10000;

document.addEventListener('DOMContentLoaded', function() {
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    
    // Load expenses from localStorage
    loadExpenses();

    // Initialize chart
    initChart();

    // Add Expense Button
    if (addExpenseBtn) {
        addExpenseBtn.addEventListener('click', function() {
            addExpense();
        });
    }

    // Add expense on Enter key
    const expenseAmount = document.getElementById('expenseAmount');
    if (expenseAmount) {
        expenseAmount.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addExpense();
            }
        });
    }

    // Update notifications
    updateNotifications();
    updateStats();
    renderExpenses();
});

function addExpense() {
    const category = document.getElementById('expenseCategory').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const date = document.getElementById('expenseDate').value;

    if (!amount || amount <= 0 || !date) {
        alert('Please fill in all fields with valid values!');
        return;
    }

    const expense = {
        id: Date.now(),
        category: category,
        amount: amount,
        date: date
    };

    expenses.push(expense);
    saveExpenses();
    updateStats();
    updateChart();
    updateNotifications();
    renderExpenses();

    // Clear form
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
}

function deleteExpense(id) {
    expenses = expenses.filter(exp => exp.id !== id);
    saveExpenses();
    updateStats();
    updateChart();
    renderExpenses();
    updateNotifications();
}

function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function loadExpenses() {
    const saved = localStorage.getItem('expenses');
    if (saved) {
        expenses = JSON.parse(saved);
    }
}

function updateStats() {
    const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = monthlyBudget - totalSpending;

    document.getElementById('totalSpending').textContent = `₹${totalSpending.toFixed(2)}`;
    document.getElementById('remainingBudget').textContent = `₹${remaining.toFixed(2)}`;

    // Update color based on remaining budget
    const remainingEl = document.getElementById('remainingBudget');
    if (remaining < 0) {
        remainingEl.classList.remove('text-white');
        remainingEl.classList.add('text-red-400');
    } else if (remaining < monthlyBudget * 0.2) {
        remainingEl.classList.remove('text-white', 'text-red-400');
        remainingEl.classList.add('text-yellow-400');
    } else {
        remainingEl.classList.remove('text-yellow-400', 'text-red-400');
        remainingEl.classList.add('text-white');
    }
}

function initChart() {
    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;

    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                label: 'Expenses by Category',
                data: [],
                backgroundColor: [
                    'rgba(147, 51, 234, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(168, 85, 247, 0.8)'
                ],
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.3)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'white',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgba(147, 51, 234, 0.5)',
                    borderWidth: 1
                }
            }
        }
    });

    updateChart();
}

function updateChart() {
    if (!expenseChart) return;

    const categoryTotals = {};
    const categoryLabels = {
        'food': '🍕 Food',
        'transport': '🚗 Transport',
        'shopping': '🛍️ Shopping',
        'entertainment': '🎬 Entertainment',
        'bills': '⚡ Bills',
        'other': '📦 Other'
    };

    expenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
    });

    const labels = Object.keys(categoryTotals).map(cat => categoryLabels[cat] || cat);
    const data = Object.values(categoryTotals);

    expenseChart.data.labels = labels;
    expenseChart.data.datasets[0].data = data;
    expenseChart.update();
}

function renderExpenses() {
    const expensesList = document.getElementById('expensesList');
    if (!expensesList) return;

    if (expenses.length === 0) {
        expensesList.innerHTML = '<p class="text-white/50 text-center py-8">No expenses added yet. Add your first expense above!</p>';
        return;
    }

    // Sort by date (newest first)
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    expensesList.innerHTML = sortedExpenses.map(expense => {
        const categoryLabels = {
            'food': '🍕 Food',
            'transport': '🚗 Transport',
            'shopping': '🛍️ Shopping',
            'entertainment': '🎬 Entertainment',
            'bills': '⚡ Bills',
            'other': '📦 Other'
        };

        const dateObj = new Date(expense.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });

        return `
            <div class="bg-white/10 rounded-lg p-4 flex justify-between items-center hover:bg-white/15 transition">
                <div class="flex items-center space-x-4">
                    <div class="text-3xl">${categoryLabels[expense.category] || '📦'}</div>
                    <div>
                        <div class="text-white font-semibold">${categoryLabels[expense.category] || expense.category}</div>
                        <div class="text-purple-200 text-sm">${formattedDate}</div>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="text-white font-bold text-lg">₹${expense.amount.toFixed(2)}</div>
                    <button onclick="deleteExpense(${expense.id})" class="text-red-400 hover:text-red-300 transition">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function updateNotifications() {
    const notificationsList = document.getElementById('notificationsList');
    if (!notificationsList) return;

    const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = monthlyBudget - totalSpending;
    const percentageUsed = (totalSpending / monthlyBudget) * 100;

    let notifications = [];

    if (percentageUsed > 90) {
        notifications.push({
            type: 'warning',
            message: '⚠️ You\'re close to your monthly limit!',
            icon: '⚠️'
        });
    } else if (percentageUsed > 75) {
        notifications.push({
            type: 'info',
            message: '💡 You\'ve used ' + Math.round(percentageUsed) + '% of your budget this month.',
            icon: '💡'
        });
    }

    if (remaining > 0 && remaining < 1000) {
        notifications.push({
            type: 'warning',
            message: '💰 Only ₹' + remaining.toFixed(0) + ' left in your budget!',
            icon: '💰'
        });
    } else if (remaining < 0) {
        notifications.push({
            type: 'danger',
            message: '❌ You\'ve exceeded your budget by ₹' + Math.abs(remaining).toFixed(0) + '!',
            icon: '❌'
        });
    }

    // Add saving goal notification
    notifications.push({
        type: 'success',
        message: '💡 Save ₹500 this week to hit your goal!',
        icon: '💡'
    });

    if (notifications.length === 0) {
        notifications.push({
            type: 'info',
            message: '✅ You\'re doing great with your budget!',
            icon: '✅'
        });
    }

    notificationsList.innerHTML = notifications.map(notif => {
        const bgColor = {
            'warning': 'bg-yellow-500/20 border-yellow-500/50',
            'info': 'bg-blue-500/20 border-blue-500/50',
            'success': 'bg-green-500/20 border-green-500/50',
            'danger': 'bg-red-500/20 border-red-500/50'
        }[notif.type] || 'bg-blue-500/20 border-blue-500/50';

        return `
            <div class="${bgColor} rounded-lg p-3 notification-enter">
                <p class="text-white text-sm">${notif.message}</p>
            </div>
        `;
    }).join('');
}

