// Aggregates nudges from budget usage, eco, pots, quests, AI tip status

document.addEventListener('DOMContentLoaded', function(){
	const hub = document.getElementById('notifHub');
	function card(text, type){
		const color = type==='warn'?'bg-yellow-500/20 border-yellow-500/50': type==='danger'?'bg-red-500/20 border-red-500/50': 'bg-blue-500/20 border-blue-500/50';
		return `<div class="${color} rounded-lg p-3 border text-white">${text}</div>`;
	}
	const get = (window.Auth?.userStorage?.getItem||localStorage.getItem).bind(localStorage);
	let items = [];
	try{
		const expenses = JSON.parse(get('expenses')||'[]');
		const budget = parseFloat(get('monthlyBudget')||'10000');
		const total = expenses.reduce((s,e)=> s+(e.amount||0),0);
		const pct = Math.round((total/Math.max(1,budget))*100);
		if (pct>=80) items.push(card(`You’ve hit ${pct}% of your monthly budget — want to balance categories?`, 'warn'));
		const ecoSum = expenses.filter(e=>e.eco).reduce((s,e)=> s+(e.amount||0),0);
		if (ecoSum>0) items.push(card(`₹${ecoSum.toFixed(0)} eco-spend so far — keep stacking Green Coins! 🌱`, 'info'));
	}catch(e){}
	try{
		const pots = JSON.parse(get('smart_pots_v1')||'[]');
		const active = pots.find(p=>p.active);
		if (active){
			items.push(card(`Active goal “${active.name}”: ₹${active.saved.toFixed(0)}/${active.target.toFixed(0)} • Streak ${active.streak||0}d`, 'info'));
		}
	}catch(e){}
	try{
		const quests = JSON.parse(get('finance_quests_v1')||'[]');
		const open = (quests||[]).filter(q=>!q.done);
		if (open.length) items.push(card(`${open.length} quest(s) open — knock one out today for XP!`, 'info'));
	}catch(e){}
	try{
		const tipDate = get('finai_daily_tip_date');
		const today = new Date().toISOString().slice(0,10);
		if (tipDate !== today) items.push(card(`New daily tip waiting in FinAI.`, 'info'));
	}catch(e){}

	hub.innerHTML = items.join('') || card('No alerts right now. You’re vibing. ✅', 'info');
});


