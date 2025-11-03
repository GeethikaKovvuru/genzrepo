// Finance Shorts & Podcast Hub logic (per-user)

document.addEventListener('DOMContentLoaded', function(){
	const addShortBtn = document.getElementById('addShortBtn');
	const addPodBtn = document.getElementById('addPodBtn');
	const shortsList = document.getElementById('shortsList');
	const podsList = document.getElementById('podsList');

	const S_KEY = 'media_shorts_v1';
	const P_KEY = 'media_pods_v1';
	const get = (window.Auth?.userStorage?.getItem||localStorage.getItem).bind(localStorage);
	const set = (window.Auth?.userStorage?.setItem||localStorage.setItem).bind(localStorage);

	function load(key){ try { return JSON.parse(get(key)||'[]'); } catch(e){ return []; } }
	function save(key, val){ try { set(key, JSON.stringify(val)); } catch(e){} }

	function render(){
		const shorts = load(S_KEY);
		const pods = load(P_KEY);
		if (shortsList) shortsList.innerHTML = shorts.map(s=>`
			<div class="rounded-xl bg-white/10 border border-white/10 p-3">
				<div class="text-white font-semibold">${s.title}</div>
				<div class="text-purple-200 text-sm">${s.desc||''}</div>
				<a href="${s.url}" target="_blank" class="text-blue-300 text-sm">Watch →</a>
			</div>
		`).join('') || '<p class="text-purple-200">No shorts yet.</p>';
		if (podsList) podsList.innerHTML = pods.map(p=>`
			<div class="rounded-xl bg-white/10 border border-white/10 p-3 flex items-center justify-between">
				<div>
					<div class="text-white font-semibold">${p.title}</div>
					<a href="${p.url}" target="_blank" class="text-blue-300 text-sm">Listen →</a>
				</div>
				<audio controls src="${p.url}" class="h-8"></audio>
			</div>
		`).join('') || '<p class="text-purple-200">No podcasts yet.</p>';
	}

	addShortBtn?.addEventListener('click', function(){
		const title = (document.getElementById('shortTitle').value||'').trim();
		const desc = (document.getElementById('shortDesc').value||'').trim();
		const url = (document.getElementById('shortUrl').value||'').trim();
		if (!title || !url) return;
		const shorts = load(S_KEY); shorts.push({ id: Date.now(), title, desc, url }); save(S_KEY, shorts); render();
	});
	addPodBtn?.addEventListener('click', function(){
		const title = (document.getElementById('podTitle').value||'').trim();
		const url = (document.getElementById('podUrl').value||'').trim();
		if (!title || !url) return;
		const pods = load(P_KEY); pods.push({ id: Date.now(), title, url }); save(P_KEY, pods); render();
	});

	render();
});


