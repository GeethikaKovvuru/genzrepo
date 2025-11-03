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

    // (Savings Tree removed from Games)

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


