// AI Assistant JavaScript
// Handles chatbot interface and AI responses

document.addEventListener('DOMContentLoaded', function() {
    const sendBtn = document.getElementById('sendBtn');
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chatMessages');
    const quickTipButtons = document.querySelectorAll('.quick-tip-btn');

    // Send message on button click
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    // Send message on Enter key
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Quick tip buttons
    quickTipButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tip = this.dataset.tip;
            handleQuickTip(tip);
        });
    });

    function sendMessage() {
        const message = userInput.value.trim();
        
        if (!message) return;

        // Add user message to chat
        addMessage(message, 'user');
        
        // Clear input
        userInput.value = '';

        // Show typing indicator
        const typingIndicator = addTypingIndicator();

        // Simulate AI thinking delay
        setTimeout(() => {
            removeTypingIndicator(typingIndicator);
            const aiResponse = generateAIResponse(message);
            addMessage(aiResponse, 'ai');
        }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex items-start space-x-3 ${sender === 'user' ? 'justify-end' : ''}`;

        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl rounded-tr-none p-4 max-w-md chat-bubble-user">
                    <p class="text-white">${escapeHtml(text)}</p>
                </div>
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-user text-white"></i>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span class="text-xl">🤖</span>
                </div>
                <div class="bg-white/20 backdrop-blur-sm rounded-2xl rounded-tl-none p-4 max-w-md chat-bubble-ai">
                    <p class="text-white">${escapeHtml(text)}</p>
                </div>
            `;
        }

        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    function addTypingIndicator() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex items-start space-x-3 typing-indicator';
        messageDiv.innerHTML = `
            <div class="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span class="text-xl">🤖</span>
            </div>
            <div class="bg-white/20 backdrop-blur-sm rounded-2xl rounded-tl-none p-4">
                <div class="flex space-x-2">
                    <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <div class="w-2 h-2 bg-white rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                    <div class="w-2 h-2 bg-white rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                </div>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
        return messageDiv;
    }

    function removeTypingIndicator(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }

    function generateAIResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        const userName = window.Auth?.getStoredUserName?.() || '';

        // Check for keywords and generate appropriate responses
        if (lowerMessage.includes('expense') || lowerMessage.includes('spending') || lowerMessage.includes('spent')) {
            return generateExpenseResponse(userName);
        } else if (lowerMessage.includes('save') || lowerMessage.includes('saving') || lowerMessage.includes('budget')) {
            return generateSavingResponse(userName);
        } else if (lowerMessage.includes('stock') || lowerMessage.includes('invest') || lowerMessage.includes('investment')) {
            return generateStockResponse(userName);
        } else if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
            return generateHelpResponse(userName);
        } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return `Hey${userName ? ' ' + userName : ''}! 👋 I got you. Ask me about expenses, savings, budgets, or investments. Let’s level up your money game. 💸`;
        } else if (lowerMessage.includes('thank')) {
            return "Anytime! 🙌 If you need more tips, just hmu."
        } else {
            return generateGenericResponse(userName);
        }
    }

    function readExpenses() {
        try {
            const raw = localStorage.getItem('expenses');
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    }

    function summarizeExpenses(expenses) {
        const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);
        const byCat = {};
        expenses.forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + e.amount; });
        const top = Object.entries(byCat).sort((a,b)=>b[1]-a[1])[0] || ['other',0];
        return { total, byCat, topCategory: top[0], topAmount: top[1] };
    }

    function formatCurrency(n) { return `₹${(n||0).toFixed(2)}`; }

    function prettifyCategory(cat) {
        const map = { food:'🍕 Food', transport:'🚗 Transport', shopping:'🛍️ Shopping', entertainment:'🎬 Entertainment', bills:'⚡ Bills', other:'📦 Other' };
        return map[cat] || cat;
    }

    function generateExpenseResponse(userName) {
        const data = readExpenses();
        if (data.length > 0) {
            const { total, topCategory, topAmount } = summarizeExpenses(data);
            const vibe = [
                `Low-key flex, ${userName || 'fam'} — you've spent ${formatCurrency(total)} this month. Biggest drip: ${prettifyCategory(topCategory)} at ${formatCurrency(topAmount)}. Want a cap on that category? 🔒`,
                `Heads up ${userName || 'bestie'}: total spend sits at ${formatCurrency(total)}. ${prettifyCategory(topCategory)} is eating most of the pie (${formatCurrency(topAmount)}). Wanna set a soft limit? 🍰`,
                `Spending update: ${formatCurrency(total)} so far. Top category = ${prettifyCategory(topCategory)}. We can ghost unnecessary buys there if you want. 👻`
            ];
            return vibe[Math.floor(Math.random()*vibe.length)];
        }
        const fallback = [
            "Looks a lil empty rn. Add a few expenses and I'll drop spicy insights. 🔥",
            "No data yet, chief. Log some spends and I’ll read the vibes. 📊",
            "Let’s start tracking — add one expense and I’ll crunch numbers fr. ⚡"
        ];
        return fallback[Math.floor(Math.random()*fallback.length)];
    }

    function generateSavingResponse(userName) {
        const data = readExpenses();
        const { byCat } = summarizeExpenses(data);
        const likelyCut = Object.entries(byCat).sort((a,b)=>b[1]-a[1])[0];
        const nudgeCat = likelyCut ? prettifyCategory(likelyCut[0]) : '🍕 Food';
        const lines = [
            `Pro tip ${userName || 'legend'}: try the 50/30/20 split. Also, trimming ${nudgeCat} a bit could save you 10-15% easy. 💾`,
            `Set an auto-transfer on payday (pay yourself first). Also ngl, ${nudgeCat} has room to chill. 🧊`,
            `Envelope method but make it digital — caps per category. Start with ${nudgeCat}. Your future self says ty. 🙏`
        ];
        return lines[Math.floor(Math.random()*lines.length)];
    }

    function generateStockResponse(userName) {
        const responses = [
            `Starter pack for ${userName || 'you'}: broad-market index funds/ETFs. Low noise, high chill. 📈`,
            "Secure the bag first: 3–6 months emergency fund. Then invest. 🛡️",
            "DCA hits different: same amount, regular intervals. Volatility who? 💼",
            "Only invest money you won’t need in 3–5 years. Short-term swings be wild. ⚠️"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    function generateHelpResponse(userName) {
        return `I got you${userName ? ', ' + userName : ''}!\n\n• 📊 Read your expense vibes\n• 💰 Saving game plan\n• 📈 Investing starter kit\n• 🎯 Budget setup with caps\n\nSay the word and we roll. 🚀`;
    }

    function generateGenericResponse(userName) {
        const responses = [
            `Let’s lock in a plan${userName ? ', ' + userName : ''}. Wanna track spends, set a budget, or peek investing? ✨`,
            "Tell me your goal: save more, spend smarter, or invest steady? I’ll tailor it fr. 🤝",
            "We can set caps per category and send nudges when you’re close. Want that? 🔔"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    function handleQuickTip(tip) {
        let message = '';
        
        switch(tip) {
            case 'expenses':
                message = 'Show me my expenses';
                break;
            case 'saving':
                message = 'Give me saving advice';
                break;
            case 'stocks':
                message = 'Tell me about stocks and investments';
                break;
            case 'budget':
                message = 'Help me with budgeting';
                break;
        }

        if (message) {
            userInput.value = message;
            sendMessage();
        }
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});

