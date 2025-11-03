// Games logic: Budget Builder

document.addEventListener('DOMContentLoaded', function() {
	const needs = document.getElementById('bbNeeds');
	const wants = document.getElementById('bbWants');
	const savings = document.getElementById('bbSavings');
	const checkBtn = document.getElementById('bbCheck');
	const result = document.getElementById('bbResult');

	// Savings Streak elements
	const ssAmount = document.getElementById('ssAmount');
	const ssLog = document.getElementById('ssLog');
	const ssInfo = document.getElementById('ssInfo');
	const ssStreak = document.getElementById('ssStreak');

	// Utilization Tuner elements
	const utilLimit = document.getElementById('utilLimit');
	const utilBalance = document.getElementById('utilBalance');
	const utilLimitVal = document.getElementById('utilLimitVal');
	const utilBalanceVal = document.getElementById('utilBalanceVal');
	const utilPct = document.getElementById('utilPct');
	const utilCheck = document.getElementById('utilCheck');

	// Savings Tree elements
	const stCanvas = document.getElementById('treeCanvas');
	const stAmount = document.getElementById('stAmount');
	const stAddLeaf = document.getElementById('stAddLeaf');
	const stAddBranch = document.getElementById('stAddBranch');
	const stCheckMilestone = document.getElementById('stCheckMilestone');
	const stTotal = document.getElementById('stTotal');
	const stMessage = document.getElementById('stMessage');
	const stQuote = document.getElementById('stQuote');

	const LEAF_UNIT = 100; // ₹ per leaf represents one leaf
	const DEFAULT_MONTHLY_BUDGET = 10000; // fallback if not stored

	// Needs vs Wants elements
	const nvwIcon = document.getElementById('nvwIcon');
	const nvwItem = document.getElementById('nvwItem');
	const nvwNeed = document.getElementById('nvwNeed');
	const nvwWant = document.getElementById('nvwWant');
	const nvwMsg = document.getElementById('nvwMsg');

	if (checkBtn) {
		checkBtn.addEventListener('click', function() {
			const n = parseFloat(needs.value) || 0;
			const w = parseFloat(wants.value) || 0;
			const s = parseFloat(savings.value) || 0;
			const total = n + w + s;
			const target = 10000;
			if (total !== target) {
				showResult(`Total must equal ₹${target}. You entered ₹${total}.`, 'warn');
				return;
			}
			const nPct = n/target, wPct = w/target, sPct = s/target;
			const nOk = Math.abs(nPct - 0.5) <= 0.05;
			const wOk = Math.abs(wPct - 0.3) <= 0.05;
			const sOk = Math.abs(sPct - 0.2) <= 0.05;
			const score = (nOk?1:0) + (wOk?1:0) + (sOk?1:0);
			if (score === 3) {
				awardXP(150);
				showResult('W move! Perfect ranges. +150 XP 🎉', 'success');
			} else if (score === 2) {
				awardXP(75);
				showResult('Close! 2/3 ranges on point. +75 XP ✨', 'info');
			} else {
				showResult('Not quite. Try matching the 50/30/20 vibe. 💡', 'warn');
			}
		});
	}

	function showResult(msg, type) {
		if (!result) return;
		const style = type==='success' ? 'bg-green-500/20 border-green-500/50' : type==='info' ? 'bg-blue-500/20 border-blue-500/50' : 'bg-yellow-500/20 border-yellow-500/50';
		result.className = `mt-4 p-4 rounded-lg border ${style}`;
		result.textContent = msg;
		result.classList.remove('hidden');
	}

	function awardXP(xp) {
		try {
			const curr = parseInt(localStorage.getItem('gameXP') || '0');
			localStorage.setItem('gameXP', String(curr + xp));
		} catch (e) {}
	}

	// Savings Streak logic
	initSavingsStreak();
	function initSavingsStreak() {
		updateStreakUI();
		if (ssLog) {
			ssLog.addEventListener('click', function() {
				const amt = Math.max(10, parseFloat(ssAmount.value) || 0);
				const today = new Date();
				const keyLast = 'savingsStreakLast';
				const keyCount = 'savingsStreakCount';
				const lastStr = localStorage.getItem(keyLast);
				const last = lastStr ? new Date(lastStr) : null;
				if (last && isSameDay(today, last)) {
					showStreak(`Already logged today. Come back tmrw for the streak heat. 🔥`, 'info');
					return;
				}
				let count = parseInt(localStorage.getItem(keyCount) || '0');
				if (last && isYesterday(today, last)) {
					count += 1;
				} else {
					count = 1;
				}
				localStorage.setItem(keyCount, String(count));
				localStorage.setItem(keyLast, today.toISOString());
				const xp = 20 + Math.min(amt, 200) / 10 + Math.min(count*5, 50);
				awardXP(Math.round(xp));
				showStreak(`Saved ₹${amt.toFixed(0)}. Streak: ${count} day(s). +${Math.round(xp)} XP ✅`, 'success');
				updateStreakUI();
			});
		}
	}

	function showStreak(msg, type) {
		if (!ssInfo) return;
		const style = type==='success' ? 'bg-green-500/20 border-green-500/50' : type==='info' ? 'bg-blue-500/20 border-blue-500/50' : 'bg-yellow-500/20 border-yellow-500/50';
		ssInfo.className = `mt-4 p-4 rounded-lg border ${style}`;
		ssInfo.textContent = msg;
		ssInfo.classList.remove('hidden');
	}

	function updateStreakUI() {
		const count = parseInt(localStorage.getItem('savingsStreakCount') || '0');
		if (ssStreak) ssStreak.textContent = `${count} day${count===1?'':'s'}`;
	}

	function isSameDay(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
	function isYesterday(a,b){ const y=new Date(a); y.setDate(a.getDate()-1); return isSameDay(y,b); }

	// Utilization Tuner logic
	initUtilization();
	function initUtilization() {
		if (!utilLimit || !utilBalance || !utilPct) return;
		utilLimit.value = 50000;
		utilBalance.value = 10000;
		updateUtilUI();
		utilLimit.addEventListener('input', updateUtilUI);
		utilBalance.addEventListener('input', updateUtilUI);
		if (utilCheck) {
			utilCheck.addEventListener('click', function() {
				const { pct } = calcUtil();
				if (pct <= 30) {
					awardXP(100);
					showUtil(`Clamped at ${pct.toFixed(1)}%. Chef’s kiss utilization. +100 XP 🎯`, 'success');
				} else if (pct <= 50) {
					awardXP(40);
					showUtil(`Decent at ${pct.toFixed(1)}%. Push under 30% for max XP. +40 XP ⚡`, 'info');
				} else {
					showUtil(`At ${pct.toFixed(1)}%. Bring it down for better score and credit vibes. 📉`, 'warn');
				}
			});
		}
	}

	function calcUtil(){
		const limit = parseInt(utilLimit.value || '1');
		const bal = parseInt(utilBalance.value || '0');
		const pct = Math.min(100, Math.max(0, (bal/Math.max(1,limit))*100));
		return { limit, bal, pct };
	}

	function updateUtilUI(){
		const { limit, bal, pct } = calcUtil();
		if (utilLimitVal) utilLimitVal.textContent = `₹${limit.toLocaleString()}`;
		if (utilBalanceVal) utilBalanceVal.textContent = `₹${bal.toLocaleString()}`;
		if (utilPct) utilPct.textContent = `${pct.toFixed(1)}%`;
	}

	function showUtil(msg, type){
		const box = document.getElementById('utilInfo');
		if (!box) return;
		const style = type==='success' ? 'bg-green-500/20 border-green-500/50' : type==='info' ? 'bg-blue-500/20 border-blue-500/50' : 'bg-yellow-500/20 border-yellow-500/50';
		box.className = `mt-4 p-4 rounded-lg border ${style}`;
		box.textContent = msg;
		box.classList.remove('hidden');
	}

    // Savings Tree logic
	initSavingsTree();
	function initSavingsTree() {
		if (!stCanvas) return;
        const state = loadTreeState();
        if (typeof state.monthlyBudget !== 'number') state.monthlyBudget = DEFAULT_MONTHLY_BUDGET;
		// Draw ground & trunk
		if (!stCanvas.querySelector('#st-ground')) {
			const ground = svgEl('rect', { id:'st-ground', x:0, y:360, width:600, height:40, fill:'rgba(16,185,129,0.5)' });
			stCanvas.appendChild(ground);
		}
		if (!stCanvas.querySelector('#st-trunk')) {
			const trunk = svgEl('rect', { id:'st-trunk', x:290, y:200, width:20, height:160, rx:8, fill:'#7c4a1f', opacity:0 });
			stCanvas.appendChild(trunk);
			animateIn(trunk);
		}
        // Rebuild branches/blooms from state
        for (let i=0;i<(state.branches||0);i++) addBranch(true);
        for (let i=0;i<(state.blooms||0);i++) addBloom(true);

        // Ensure baseline leaves equal to monthly budget (1 leaf per LEAF_UNIT)
        const baselineLeaves = Math.max(0, Math.floor((state.monthlyBudget || DEFAULT_MONTHLY_BUDGET) / LEAF_UNIT));
        if (typeof state.currentLeaves !== 'number') state.currentLeaves = baselineLeaves;
        // Normalize visual leaves to currentLeaves
        const existingLeaves = stCanvas.querySelectorAll('.st-leaf').length;
        if (existingLeaves < state.currentLeaves) {
            for (let i=0;i<state.currentLeaves-existingLeaves;i++) addLeaf(true);
        } else if (existingLeaves > state.currentLeaves) {
            for (let i=0;i<existingLeaves-state.currentLeaves;i++) removeLeaf(true);
        }
        saveTreeState(state);
        updateTotal(state.totalSaved || 0);

		stAddLeaf?.addEventListener('click', () => {
			const amt = Math.max(10, parseFloat(stAmount.value) || 0);
			const s = loadTreeState();
			s.totalSaved = (s.totalSaved || 0) + amt;
			s.leaves = (s.leaves || 0) + 1;
			saveTreeState(s);
			addLeaf(false);
			updateTotal(s.totalSaved);
			toastTree(`+1 leaf for saving ₹${amt.toFixed(0)}! 🍃`,'success');
		});

		stAddBranch?.addEventListener('click', () => {
			const s = loadTreeState();
			s.branches = (s.branches || 0) + 1;
			saveTreeState(s);
			addBranch(false);
			toastTree('Weekly goal smashed! New branch added. 🌿','info');
		});

		stCheckMilestone?.addEventListener('click', () => {
			checkMilestones();
		});

		cycleQuotes();

        // Initial sync from Expense Tracker (add leaves for Savings, drop leaves for spend)
        processBudgetLeavesFromExpenses();
		// Poll for changes while on this page
        setInterval(processBudgetLeavesFromExpenses, 2000);
	}

	function loadTreeState(){
		try { return JSON.parse(localStorage.getItem('savingsTree') || '{}'); } catch(e){ return {}; }
	}
	function saveTreeState(s){
		try { localStorage.setItem('savingsTree', JSON.stringify(s)); } catch(e){}
	}

	function getProcessedIds(){
		try { return JSON.parse(localStorage.getItem('savingsTreeProcessedIds') || '[]'); } catch(e){ return []; }
	}
	function setProcessedIds(ids){
		try { localStorage.setItem('savingsTreeProcessedIds', JSON.stringify(ids)); } catch(e){}
	}

    function processBudgetLeavesFromExpenses(){
		let expenses = [];
		try { expenses = JSON.parse(localStorage.getItem('expenses') || '[]'); } catch(e){ expenses = []; }
		const processed = new Set(getProcessedIds());
        let updated = false;
		const s = loadTreeState();
		const now = new Date();
		const weekKey = getWeekKey(now);
		let weekSum = 0;
        expenses.forEach(exp => {
            const amount = exp.amount || 0;
            const units = Math.max(0, Math.floor(amount / LEAF_UNIT));
            const d = new Date(exp.date);
            if (exp.category === 'savings' && getWeekKey(d) === weekKey) weekSum += amount;
            if (!processed.has(exp.id)) {
                processed.add(exp.id);
                if (exp.category === 'savings') {
                    for (let i=0;i<units;i++) addLeaf(false);
                    s.currentLeaves = Math.min((s.currentLeaves||0) + units, Math.floor((s.monthlyBudget||DEFAULT_MONTHLY_BUDGET)/LEAF_UNIT));
                    s.totalSaved = (s.totalSaved||0) + amount;
                } else {
                    for (let i=0;i<units;i++) removeLeaf(false);
                    s.currentLeaves = Math.max(0, (s.currentLeaves||0) - units);
                }
                updated = true;
            }
        });
		if (updated) {
			saveTreeState(s);
			setProcessedIds(Array.from(processed));
			updateTotal(s.totalSaved||0);
			checkMilestones();
		}
		// Weekly branch goal: add one branch per week if total savings in that ISO week >= 500
		const weekFlagKey = `branch_week_${weekKey}`;
		if (weekSum >= 500 && !s[weekFlagKey]) {
			s[weekFlagKey] = true;
			s.branches = (s.branches||0) + 1;
			saveTreeState(s);
			addBranch(false);
			toastTree('Weekly savings goal hit! Branch added 🌿','success');
		}
	}

	function getWeekKey(d){
		const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
		const dayNum = date.getUTCDay() || 7;
		date.setUTCDate(date.getUTCDate() + 4 - dayNum);
		const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
		const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1)/7);
		return `${date.getUTCFullYear()}-W${weekNo}`;
	}

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

	function addBranch(isRestore){
		const x = 300;
		const startY = 260 - Math.random()*80; // somewhere on trunk upper half
		const dir = Math.random() > 0.5 ? 1 : -1;
		const length = 80 + Math.random()*40;
		const endX = x + dir * length;
		const endY = startY - 20 - Math.random()*30;
		const path = svgEl('path', { d: `M ${x} ${startY} Q ${x+dir*40} ${startY-30}, ${endX} ${endY}`, stroke:'#5f3b15', 'stroke-width':'6', fill:'none', 'stroke-linecap':'round', opacity: isRestore? '1':'0' });
		stCanvas.appendChild(path);
		if (!isRestore) animateIn(path);
	}

    function addLeaf(isRestore){
		// random around branches or trunk top
		const cx = 260 + Math.random()*80 + (Math.random()>0.5? 80: -80) * Math.random();
		const cy = 160 + Math.random()*120;
        const leaf = svgEl('ellipse', { cx: cx, cy: cy, rx: 10, ry: 16, fill: randomLeafColor(), opacity: isRestore? '1':'0' });
        leaf.classList.add('st-leaf');
		leaf.style.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))';
		stCanvas.appendChild(leaf);
		if (!isRestore) animateIn(leaf);
	}

    function removeLeaf(isRestore){
        const leaf = stCanvas.querySelector('.st-leaf');
        if (!leaf) return;
        if (isRestore) { stCanvas.removeChild(leaf); return; }
        leaf.style.transition = 'all 700ms ease';
        leaf.style.transform = 'translateY(40px) rotate(15deg)';
        leaf.setAttribute('opacity','0');
        setTimeout(()=>{ leaf.parentNode && leaf.parentNode.removeChild(leaf); }, 700);
    }

	function addBloom(isRestore){
		const cx = 240 + Math.random()*120;
		const cy = 120 + Math.random()*80;
		const flower = svgEl('circle', { cx: cx, cy: cy, r: 0, fill: randomBloomColor(), opacity: isRestore? '1':'1' });
		stCanvas.appendChild(flower);
		if (!isRestore){
			flower.style.transition = 'all 600ms ease';
			requestAnimationFrame(()=>{
				flower.setAttribute('r','10');
			});
		} else {
			flower.setAttribute('r','10');
		}
	}

	function randomLeafColor(){
		const greens = ['#22c55e','#16a34a','#10b981','#4ade80'];
		return greens[Math.floor(Math.random()*greens.length)];
	}
	function randomBloomColor(){
		const colors = ['#f472b6','#f59e0b','#a78bfa','#60a5fa'];
		return colors[Math.floor(Math.random()*colors.length)];
	}

	function checkMilestones(){
		const s = loadTreeState();
		const milestones = [1000, 5000, 10000, 20000];
		let added = 0;
		milestones.forEach(m => {
			const key = `milestone_${m}`;
			if (!s[key] && (s.totalSaved||0) >= m) {
				s[key] = true;
				s.blooms = (s.blooms||0) + 1;
				addBloom(false);
				added++;
			}
		});
		saveTreeState(s);
		if (added>0) {
			toastTree(`Milestone bloom unlocked! +${added} 🌸`, 'success');
			awardXP(added*120);
		} else {
			toastTree('No new milestones yet. Keep saving and watch it bloom. 🌱', 'info');
		}
	}

	function updateTotal(val){
		if (stTotal) stTotal.textContent = `₹${Number(val).toLocaleString()}`;
	}

	function toastTree(msg, type){
		if (!stMessage) return;
		const style = type==='success' ? 'bg-green-500/20 border-green-500/50' : 'bg-blue-500/20 border-blue-500/50';
		stMessage.className = `p-3 rounded-lg border ${style}`;
		stMessage.textContent = msg;
		stMessage.classList.remove('hidden');
		setTimeout(()=>{ stMessage.classList.add('hidden'); }, 2500);
	}

	function cycleQuotes(){
		if (!stQuote) return;
		const quotes = [
			'“As your money grows, your tree grows too.”',
			'“Small leaves today, big shade tomorrow.”',
			'“Consistency waters your future.”',
			'“Plant savings now; harvest freedom later.”'
		];
		let i = 0;
		setInterval(()=>{
			i = (i+1)%quotes.length;
			stQuote.style.opacity = '0';
			stQuote.style.transition = 'opacity 400ms ease';
			setTimeout(()=>{ stQuote.textContent = quotes[i]; stQuote.style.opacity = '1'; }, 400);
		}, 4000);
	}

	// Needs vs Wants game logic
	initNeedsVsWants();
	function initNeedsVsWants(){
		if (!nvwItem || !nvwNeed || !nvwWant) return;
		const items = [
			{ icon:'🍚', name:'Rice (home cooking)', type:'need' },
			{ icon:'💊', name:'Medicine', type:'need' },
			{ icon:'🚌', name:'Bus pass', type:'need' },
			{ icon:'📱', name:'New flagship phone', type:'want' },
			{ icon:'🍕', name:'Pizza takeout', type:'want' },
			{ icon:'👟', name:'Sneaker upgrade', type:'want' },
			{ icon:'⚡', name:'Electricity bill', type:'need' },
			{ icon:'🎮', name:'Gaming subscription', type:'want' },
			{ icon:'🥦', name:'Groceries', type:'need' },
			{ icon:'☕', name:'Designer coffee', type:'want' }
		];
		let idx = -1;
		nextCard();
		nvwNeed.addEventListener('click', ()=>judge('need'));
		nvwWant.addEventListener('click', ()=>judge('want'));
		function nextCard(){
			idx = (idx + 1) % items.length;
			const it = items[idx];
			if (nvwIcon) nvwIcon.textContent = it.icon;
			if (nvwItem) nvwItem.textContent = it.name;
			nvwMsg && nvwMsg.classList.add('hidden');
		}
		function judge(ans){
			const it = items[idx];
			if (!it) return;
			const correct = ans === it.type;
			const style = correct ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50';
			if (nvwMsg){
				nvwMsg.className = `p-3 rounded-lg border ${style}`;
				nvwMsg.textContent = correct ? 'Nice! +30 XP' : 'Hmm, that’s more of a want. No XP this time.';
				nvwMsg.classList.remove('hidden');
			}
			if (correct) awardXP(30);
			setTimeout(nextCard, 1000);
		}
	}
});


