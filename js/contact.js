// Peer Mentorship marketplace logic

document.addEventListener('DOMContentLoaded', function(){
	const addMentorBtn = document.getElementById('addMentorBtn');
	const addRequestBtn = document.getElementById('addRequestBtn');
	const mentorsList = document.getElementById('mentorsList');
	const requestsList = document.getElementById('requestsList');

	const M_KEY = 'peer_mentors_v1';
	const R_KEY = 'peer_requests_v1';

	function load(key){ try { return JSON.parse((window.Auth?.userStorage?.getItem||localStorage.getItem).call(localStorage, key)||'[]'); } catch(e){ return []; } }
	function save(key, val){ try { (window.Auth?.userStorage?.setItem||localStorage.setItem).call(localStorage, key, JSON.stringify(val)); } catch(e){} }
	function msg(text, type){ const box=document.getElementById('peerMsg'); if(!box) return; const style= type==='ok'?'bg-green-500/20 border-green-500/50':'bg-yellow-500/20 border-yellow-500/50'; box.className=`p-2 rounded-lg border mt-4 ${style}`; box.textContent=text; box.classList.remove('hidden'); setTimeout(()=>box.classList.add('hidden'),2000); }

	function render(){
		const mentors = load(M_KEY);
		const reqs = load(R_KEY);
		if (mentorsList) mentorsList.innerHTML = mentors.map(m=>`
			<div class="p-3 rounded-lg bg-white/10 border border-white/10 flex items-center justify-between">
				<div>
					<div class="text-white font-semibold">${m.name}</div>
					<div class="text-purple-200 text-sm">${m.areas}</div>
				</div>
				<button class="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded" data-assign="${m.id}">Assign</button>
			</div>
		`).join('') || '<p class="text-purple-200">No mentors yet.</p>';
		if (requestsList) requestsList.innerHTML = reqs.map(r=>`
			<div class="p-3 rounded-lg bg-white/10 border border-white/10">
				<div class="flex items-center justify-between">
					<div class="text-white font-semibold">${r.topic}</div>
					<div class="text-purple-200 text-xs">${r.status||'Open'}</div>
				</div>
				<div class="text-purple-200 text-sm">${r.details}</div>
			</div>
		`).join('') || '<p class="text-purple-200">No requests yet.</p>';
		// assign buttons link first open request
		document.querySelectorAll('[data-assign]').forEach(btn => btn.addEventListener('click', function(){
			const mentorId = parseInt(this.getAttribute('data-assign'));
			const reqs = load(R_KEY);
			const open = reqs.find(r=> (r.status||'Open')==='Open');
			if (!open) { msg('No open requests to assign','warn'); return; }
			open.status = 'Assigned';
			save(R_KEY, reqs);
			render();
			msg('Assigned mentor to request ✅','ok');
		}));
	}

	addMentorBtn?.addEventListener('click', function(){
		const name = (document.getElementById('mentorName').value||'').trim();
		const areas = (document.getElementById('mentorAreas').value||'').trim();
		if (!name || !areas) { msg('Enter name and expertise','warn'); return; }
		const mentors = load(M_KEY);
		mentors.push({ id: Date.now(), name, areas });
		save(M_KEY, mentors);
		render();
		msg('Mentor listed ✅','ok');
	});

	addRequestBtn?.addEventListener('click', function(){
		const topic = (document.getElementById('reqTopic').value||'').trim();
		const details = (document.getElementById('reqDetails').value||'').trim();
		if (!topic || !details) { msg('Enter topic and details','warn'); return; }
		const reqs = load(R_KEY);
		reqs.push({ id: Date.now(), topic, details, status: 'Open' });
		save(R_KEY, reqs);
		render();
		msg('Request posted ✅','ok');
	});

	render();
});


