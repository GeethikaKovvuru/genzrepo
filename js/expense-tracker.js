// Expense Tracker JavaScript
// Handles expense logging, Chart.js rendering, and notifications

let expenses = [];
let expenseChart = null;
let monthlyBudget = 10000;

document.addEventListener('DOMContentLoaded', function() {
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const budgetInput = document.getElementById('budgetInput');
    const saveBudgetBtn = document.getElementById('saveBudgetBtn');
    
    // Load expenses from localStorage
    loadExpenses();
    loadBudget();

    // Initialize chart
    initChart();

    // Init animated Savings Tree (session-based)
    initSavingsTreeSession();

    // Add Expense Button
    if (addExpenseBtn) {
        addExpenseBtn.addEventListener('click', function() {
            addExpense();
        });
    }

    // Budget save
    if (saveBudgetBtn && budgetInput) {
        saveBudgetBtn.addEventListener('click', function() {
            const val = parseFloat(budgetInput.value);
            if (!val || val < 100) {
                alert('Please enter a valid monthly budget.');
                return;
            }
            monthlyBudget = val;
            saveBudget();
            updateStats();
            updateChart();
            updateSavingsTreeSession();
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
    updateSavingsTreeSession();
    updateEcoTracker();
    updateHealthScore();

    // Savings Pots init
    initPots();
});

function addExpense() {
    const category = document.getElementById('expenseCategory').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const date = document.getElementById('expenseDate').value;
    const eco = !!document.getElementById('expenseEco')?.checked;

    if (!amount || amount <= 0 || !date) {
        alert('Please fill in all fields with valid values!');
        return;
    }

    const expense = {
        id: Date.now(),
        category: category,
        amount: amount,
        date: date,
        eco: eco
    };

    expenses.push(expense);
    saveExpenses();
    updateStats();
    updateChart();
    updateNotifications();
    renderExpenses();
    // Event-driven leaf delta: savings = credit (grow), others = debit (shed)
    try {
        const canvas = document.getElementById('et2Canvas');
        if (canvas) {
            const leafUnit = (monthlyBudget || 10000) / TOTAL_LEAVES;
            const units = Math.max(0, Math.floor((amount || 0) / Math.max(1, leafUnit)));
            if (category === 'savings') {
                for (let i=0;i<units;i++) addEt2Leaf(canvas, false);
            } else {
                for (let i=0;i<units;i++) removeEt2Leaf(canvas, false);
            }
        }
    } catch (e) {}
    updateSavingsTreeSession();
    updateEcoTracker();
    updateHealthScore();

    // Clear form
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
}

function deleteExpense(id) {
    const expToDelete = expenses.find(exp => exp.id === id);
    expenses = expenses.filter(exp => exp.id !== id);
    saveExpenses();
    updateStats();
    updateChart();
    renderExpenses();
    updateNotifications();
    try {
        const canvas = document.getElementById('et2Canvas');
        if (canvas && expToDelete) {
            const leafUnit = (monthlyBudget || 10000) / TOTAL_LEAVES;
            const units = Math.max(0, Math.floor((expToDelete.amount || 0) / Math.max(1, leafUnit)));
            if (expToDelete.category === 'savings') {
                // deleting a credit => remove leaves that were added
                for (let i=0;i<units;i++) removeEt2Leaf(canvas, false);
            } else {
                // deleting a debit => add leaves back
                for (let i=0;i<units;i++) addEt2Leaf(canvas, false);
            }
        }
    } catch (e) {}
    updateSavingsTreeSession();
    updateEcoTracker();
    updateHealthScore();
}

function saveExpenses() {
    const set = (window.Auth?.userStorage?.setItem||localStorage.setItem).bind(localStorage);
    set('expenses', JSON.stringify(expenses));
}

function loadExpenses() {
    const get = (window.Auth?.userStorage?.getItem||localStorage.getItem).bind(localStorage);
    const saved = get('expenses');
    if (saved) {
        expenses = JSON.parse(saved);
    }
}

function saveBudget() {
    try { (window.Auth?.userStorage?.setItem||localStorage.setItem).call(localStorage, 'monthlyBudget', String(monthlyBudget)); } catch (e) {}
}

function loadBudget() {
    try {
        const raw = (window.Auth?.userStorage?.getItem||localStorage.getItem).call(localStorage, 'monthlyBudget');
        const b = parseFloat(raw);
        if (!isNaN(b) && b > 0) monthlyBudget = b;
    } catch (e) {}
    const budgetInput = document.getElementById('budgetInput');
    if (budgetInput) budgetInput.value = monthlyBudget;
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
        'savings': '💾 Savings',
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
        'savings': '💾 Savings',
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

// ===== Eco-Tracker =====
function updateEcoTracker(){
    const coinsEl = document.getElementById('greenCoins');
    const prog = document.getElementById('greenProgress');
    if (!coinsEl || !prog) return;
    const now = new Date();
    const ecoSum = expenses
        .filter(e => e.eco && isSameMonthYear(new Date(e.date), now))
        .reduce((s,e)=> s + (e.amount||0), 0);
    const coins = Math.floor(ecoSum / 100);
    coinsEl.textContent = String(coins);
    const monthlyBase = monthlyBudget || 10000;
    const pct = Math.min(100, Math.round((ecoSum / Math.max(1, monthlyBase)) * 100));
    prog.style.width = pct + '%';
}

// ===== Health Score =====
function updateHealthScore(){
    const scoreEl = document.getElementById('healthScore');
    const emojiEl = document.getElementById('healthEmoji');
    const breakdownEl = document.getElementById('healthBreakdown');
    if (!scoreEl || !emojiEl || !breakdownEl) return;

    const totalSpending = expenses.reduce((s,e)=> s + (e.amount||0), 0);
    const percentageUsed = Math.max(0, Math.min(100, (totalSpending / Math.max(1, monthlyBudget)) * 100));
    const budgetScore = 100 - percentageUsed; // more remaining = higher score

    const now = new Date();
    const ecoSum = expenses.filter(e=>e.eco && isSameMonthYear(new Date(e.date), now)).reduce((s,e)=> s + (e.amount||0), 0);
    const ecoScore = Math.min(100, (ecoSum / Math.max(1, monthlyBudget)) * 100);

    // streak: max streak from pots
    let pots = [];
    try { pots = JSON.parse((window.Auth?.userStorage?.getItem||localStorage.getItem).call(localStorage, 'smart_pots_v1')||'[]'); } catch(e){}
    const maxStreak = pots.reduce((m,p)=> Math.max(m, p.streak||0), 0);
    const streakScore = Math.min(100, (maxStreak||0) * 10);

    const score = Math.round(0.5*budgetScore + 0.3*ecoScore + 0.2*streakScore);
    scoreEl.textContent = String(score);
    const emoji = score>=85?'🟢':score>=70?'🟡':score>=50?'🟠':'🔴';
    emojiEl.textContent = emoji;
    breakdownEl.textContent = `Budget: ${budgetScore.toFixed(0)} • Eco: ${ecoScore.toFixed(0)} • Streak: ${streakScore.toFixed(0)}`;
}

// ===== Animated Savings Tree (session-based) =====
const TOTAL_LEAVES = 100;
function initSavingsTreeSession() {
    const canvas = document.getElementById('et2Canvas');
    if (!canvas) return;

    // Reset on login flag
    try {
        if (localStorage.getItem('resetSavingsTree') === '1') {
            canvas.innerHTML = '';
            localStorage.removeItem('resetSavingsTree');
        }
    } catch (e) {}

    // Draw ground and trunk
    if (!canvas.querySelector('#et2-ground')) {
        const ground = svgEl('rect', { id:'et2-ground', x:0, y:360, width:600, height:40, fill:'rgba(16,185,129,0.5)' });
        canvas.appendChild(ground);
    }
    if (!canvas.querySelector('#et2-trunk')) {
        const trunk = svgEl('rect', { id:'et2-trunk', x:290, y:200, width:20, height:160, rx:8, fill:'#7c4a1f', opacity:'0' });
        canvas.appendChild(trunk);
        animateIn(trunk);
    }

    // Draw baseline branches for a visible canopy
    if (!canvas.querySelector('.et2-branch')) {
        drawEt2Branches(canvas);
    }

    // Ensure full leaves baseline at session start
    const since = getTreeSessionStart();
    const existingLeaves = canvas.querySelectorAll('.et2-leaf').length;
    if (existingLeaves < TOTAL_LEAVES) {
        for (let i=0;i<TOTAL_LEAVES-existingLeaves;i++) addEt2Leaf(canvas, true);
    }
}

// ===== Smart Savings Pots =====
const POTS_KEY = 'smart_pots_v1';
function loadPots(){
    try { return JSON.parse((window.Auth?.userStorage?.getItem||localStorage.getItem).call(localStorage, POTS_KEY) || '[]'); } catch(e){ return []; }
}
function savePots(pots){
    try { (window.Auth?.userStorage?.setItem||localStorage.setItem).call(localStorage, POTS_KEY, JSON.stringify(pots)); } catch(e){}
}
function initPots(){
    const createBtn = document.getElementById('createPotBtn');
    const addBtn = document.getElementById('addToPotBtn');
    renderPots();
    if (createBtn) createBtn.addEventListener('click', createPot);
    if (addBtn) addBtn.addEventListener('click', addToActivePot);
}
function createPot(){
    const name = (document.getElementById('potName').value||'').trim();
    const target = parseFloat(document.getElementById('potTarget').value)||0;
    const deadline = document.getElementById('potDeadline').value||'';
    if (!name || target<=0) { msgPot('Enter name and valid target', 'warn'); return; }
    const pots = loadPots();
    pots.push({ id: Date.now(), name, target, saved:0, deadline, active: pots.length===0, streak:0, lastDay:'' });
    savePots(pots);
    renderPots();
    msgPot('Pot created ✅','ok');
}
function renderPots(){
    const holder = document.getElementById('potsList'); if (!holder) return;
    const pots = loadPots();
    holder.innerHTML = pots.map(p => {
        const pct = Math.min(100, Math.round((p.saved / Math.max(1,p.target)) * 100));
        return `
        <div class="p-3 rounded-lg bg-white/10 border border-white/10">
            <div class="flex items-center justify-between">
                <div class="text-white font-semibold">${p.name}</div>
                <div class="text-purple-200 text-xs">${p.deadline ? p.deadline : ''}</div>
            </div>
            <div class="text-purple-200 text-sm">₹${p.saved.toFixed(0)} / ₹${p.target.toFixed(0)} • Streak: ${p.streak}d</div>
            <div class="w-full bg-white/20 rounded-full h-2 mt-1">
                <div class="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full" style="width:${pct}%"></div>
            </div>
            <div class="mt-2 flex items-center justify-between">
                <label class="text-xs text-white/80 flex items-center space-x-1">
                    <input type="radio" name="activePot" ${p.active?'checked':''} data-id="${p.id}"> <span>Active</span>
                </label>
                <button class="text-red-300 text-xs" data-del="${p.id}">Remove</button>
            </div>
        </div>`;
    }).join('');
    // wire events
    holder.querySelectorAll('input[name="activePot"]').forEach(r => r.addEventListener('change', () => setActivePot(parseInt(r.getAttribute('data-id')))) );
    holder.querySelectorAll('button[data-del]').forEach(b => b.addEventListener('click', () => deletePot(parseInt(b.getAttribute('data-del')))) );
}
function setActivePot(id){
    const pots = loadPots();
    pots.forEach(p => p.active = (p.id===id));
    savePots(pots);
    renderPots();
}
function deletePot(id){
    let pots = loadPots();
    pots = pots.filter(p=>p.id!==id);
    if (pots.length>0 && !pots.some(p=>p.active)) pots[0].active = true;
    savePots(pots);
    renderPots();
}
function addToActivePot(){
    const amt = parseFloat(document.getElementById('potContribution').value)||0;
    if (amt<=0) { msgPot('Enter a valid amount', 'warn'); return; }
    const pots = loadPots();
    const active = pots.find(p=>p.active);
    if (!active) { msgPot('Create and select an active pot first', 'warn'); return; }
    active.saved += amt;
    // streak update
    const today = new Date().toISOString().slice(0,10);
    if (active.lastDay) {
        const y = new Date(today); y.setDate(y.getDate()-1);
        if (active.lastDay === y.toISOString().slice(0,10)) active.streak += 1; else if (active.lastDay !== today) active.streak = 1;
    } else { active.streak = 1; }
    active.lastDay = today;
    savePots(pots);
    renderPots();
    msgPot('Added to pot ✅', 'ok');
}
function msgPot(text, type){
    const el = document.getElementById('potMsg'); if (!el) return;
    const style = type==='ok' ? 'bg-green-500/20 border-green-500/50' : 'bg-yellow-500/20 border-yellow-500/50';
    el.className = `p-2 rounded-lg border mt-2 ${style}`;
    el.textContent = text;
    el.classList.remove('hidden');
    setTimeout(()=> el.classList.add('hidden'), 2000);
}

function drawEt2Branches(canvas){
    const x = 300;
    const configs = [
        { sy: 240, dir: 1, len: 110 },
        { sy: 260, dir: -1, len: 120 },
        { sy: 220, dir: 1, len: 90 },
        { sy: 200, dir: -1, len: 100 }
    ];
    configs.forEach(c => {
        const endX = x + c.dir * c.len;
        const endY = c.sy - 30;
        const path = svgEl('path', { d: `M ${x} ${c.sy} Q ${x + c.dir*50} ${c.sy-40}, ${endX} ${endY}`, stroke:'#5f3b15', 'stroke-width':'6', fill:'none', 'stroke-linecap':'round', opacity:'0' });
        path.classList.add('et2-branch');
        canvas.appendChild(path);
        animateIn(path);
    });
}

function updateSavingsTreeSession() {
    const canvas = document.getElementById('et2Canvas');
    if (!canvas) return;
    // Ensure structure exists even if called before init was complete
    if (!canvas.querySelector('#et2-trunk')) {
        initSavingsTreeSession();
    }
    // Compute spending for CURRENT MONTH only (non-savings)
    const monthlyBase = monthlyBudget || 10000;
    const now = new Date();
    const monthSpent = expenses
        .filter(e => e.category !== 'savings' && isSameMonthYear(new Date(e.date), now))
        .reduce((s,e)=> s + (e.amount||0), 0);
    const ratio = Math.max(0, Math.min(1, (monthlyBase - monthSpent) / monthlyBase));
    const targetLeaves = Math.floor(TOTAL_LEAVES * ratio);

    const existingLeaves = canvas.querySelectorAll('.et2-leaf').length;
    if (existingLeaves < targetLeaves) {
        for (let i=0;i<targetLeaves-existingLeaves;i++) addEt2Leaf(canvas, false);
    } else if (existingLeaves > targetLeaves) {
        for (let i=0;i<existingLeaves-targetLeaves;i++) removeEt2Leaf(canvas, false);
    }

    const spentEl = document.getElementById('et2Spent');
    if (spentEl) spentEl.textContent = `₹${monthSpent.toFixed(2)}`;
}

function getTreeSessionStart() {
    try {
        const s = (window.Auth?.userStorage?.getItem||localStorage.getItem).call(localStorage, 'treeSinceLogin');
        if (s) return new Date(s);
    } catch (e) {}
    const now = new Date();
    try { (window.Auth?.userStorage?.setItem||localStorage.setItem).call(localStorage, 'treeSinceLogin', now.toISOString()); } catch (e) {}
    return now;
}

function isSameMonthYear(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function addEt2Leaf(canvas, instant) {
    const cx = 260 + Math.random()*80 + (Math.random()>0.5? 80: -80) * Math.random();
    const cy = 160 + Math.random()*120;
    const leaf = svgEl('ellipse', { cx: cx, cy: cy, rx: 10, ry: 16, fill: randomLeafColor(), opacity: instant ? '1':'0' });
    leaf.classList.add('et2-leaf');
    leaf.style.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))';
    canvas.appendChild(leaf);
    if (!instant) animateIn(leaf);
}

function removeEt2Leaf(canvas, instant) {
    const leaf = canvas.querySelector('.et2-leaf');
    if (!leaf) return;
    if (instant) { canvas.removeChild(leaf); return; }
    leaf.style.transition = 'all 700ms ease';
    leaf.style.transform = 'translateY(40px) rotate(15deg)';
    leaf.setAttribute('opacity','0');
    setTimeout(()=>{ leaf.parentNode && leaf.parentNode.removeChild(leaf); }, 700);
}

// ---- SVG/Animation helpers ----
function svgEl(tag, attrs){
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs||{}).forEach(([k,v])=> el.setAttribute(k, String(v)));
    return el;
}

function animateIn(el){
    el.style.transition = 'all 600ms ease';
    el.style.transformOrigin = 'center';
    el.style.transform = 'scale(0.8) translateY(10px)';
    el.setAttribute('opacity','0');
    requestAnimationFrame(()=>{
        el.setAttribute('opacity','1');
        el.style.transform = 'scale(1) translateY(0)';
    });
}

function randomLeafColor(){
    const greens = ['#22c55e','#16a34a','#10b981','#4ade80'];
    return greens[Math.floor(Math.random()*greens.length)];
}
