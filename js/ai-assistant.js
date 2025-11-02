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

        // Check for keywords and generate appropriate responses
        if (lowerMessage.includes('expense') || lowerMessage.includes('spending') || lowerMessage.includes('spent')) {
            return generateExpenseResponse();
        } else if (lowerMessage.includes('save') || lowerMessage.includes('saving') || lowerMessage.includes('budget')) {
            return generateSavingResponse();
        } else if (lowerMessage.includes('stock') || lowerMessage.includes('invest') || lowerMessage.includes('investment')) {
            return generateStockResponse();
        } else if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
            return generateHelpResponse();
        } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return "Hello! 👋 I'm here to help you with your finances. You can ask me about expenses, saving tips, investments, or budget advice!";
        } else if (lowerMessage.includes('thank')) {
            return "You're welcome! 😊 Feel free to ask me anything else about your finances.";
        } else {
            return generateGenericResponse();
        }
    }

    function generateExpenseResponse() {
        const responses = [
            "Based on your recent activity, you've spent ₹1,200 on shopping this week. Consider setting a weekly shopping budget to stay on track! 💡",
            "Your expenses this month show you're spending 35% on food, 25% on transport, and 40% on other categories. Try to balance it out for better financial health! 📊",
            "I noticed you've been spending more than usual. Here's a tip: track your expenses daily and review them weekly to spot patterns! 📈"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    function generateSavingResponse() {
        const responses = [
            "You can save 10% by reducing your takeout expenses. Try meal prepping on weekends! 🍱",
            "I recommend saving at least 20% of your income. Start with small amounts and gradually increase. You've got this! 💪",
            "Consider the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. This is a great starting point! 📊",
            "Try the envelope method: allocate cash for different categories. When it's gone, you stop spending in that category! 💰"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    function generateStockResponse() {
        const responses = [
            "For beginners, I recommend starting with index funds or ETFs. They offer diversification and lower risk! 📈",
            "Before investing, make sure you have an emergency fund covering 3-6 months of expenses. Safety first! 🛡️",
            "Dollar-cost averaging is a great strategy: invest a fixed amount regularly, regardless of market conditions. This reduces the impact of volatility! 💼",
            "Remember: don't invest money you'll need in the next 3-5 years. Stocks can be volatile in the short term! ⚠️"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    function generateHelpResponse() {
        return "I can help you with:\n\n• 📊 Analyzing your expenses\n• 💰 Saving strategies and tips\n• 📈 Investment advice\n• 🎯 Budget planning\n\nJust ask me anything! I'm here to help! 😊";
    }

    function generateGenericResponse() {
        const responses = [
            "That's an interesting question! Based on financial best practices, I'd recommend tracking your expenses first, then setting realistic savings goals. Would you like me to help you create a budget? 💡",
            "Great question! To give you the best advice, could you tell me more about your current financial situation? For example, are you looking to save, invest, or track expenses? 🤔",
            "I'm here to help you make smarter financial decisions! You can ask me about expenses, savings, investments, or budgets. What would you like to know? ✨"
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

