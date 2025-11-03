// Simple sitewide auth utilities for storing and showing username

function getStoredUserName() {
	try {
		return localStorage.getItem('userName') || '';
	} catch (e) {
		return '';
	}
}

function setStoredUserName(name) {
	try {
		localStorage.setItem('userName', name || '');
	} catch (e) {
		// ignore
	}
}

function clearStoredUserName() {
	try {
		localStorage.removeItem('userName');
	} catch (e) {
		// ignore
	}
}

function applyNavGreeting() {
	const name = getStoredUserName();
	const greetingEl = document.getElementById('navUserGreeting');
	const authCtaEl = document.getElementById('navAuthCta');
	if (greetingEl) {
		greetingEl.textContent = name ? `Hey, ${name} ✨` : '';
		greetingEl.classList.toggle('hidden', !name);
	}
	if (authCtaEl) {
		if (name) {
			authCtaEl.innerHTML = '<button id="logoutBtn" class="text-white/80 hover:text-purple-300 transition">Logout</button>';
			const logoutBtn = document.getElementById('logoutBtn');
			logoutBtn?.addEventListener('click', function() {
				clearStoredUserName();
				applyNavGreeting();
				// Optional: redirect to login
				try { if (window.location.pathname.toLowerCase().endsWith('index.html')) return; } catch (e) {}
				window.location.href = 'login.html';
			});
		} else {
			authCtaEl.innerHTML = '<a href="login.html" class="text-white/80 hover:text-purple-300 transition">Login</a>';
		}
	}
}

document.addEventListener('DOMContentLoaded', function() {
	applyNavGreeting();
});

// Expose for other scripts
window.Auth = { getStoredUserName, setStoredUserName, clearStoredUserName };


