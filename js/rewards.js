// Rewards & Gamification JavaScript
// Handles quiz, badges, XP, and confetti animations

let currentQuizQuestion = 0;
let quizScore = 0;
let userXP = 1250;
let userLevel = 5;

// Question banks by domain
const QUESTION_BANK = {
    general: [
        { question: 'What is the recommended percentage of income to save?', options: ['10%','20%','30%','5%'], correct: 1 },
        { question: 'What does ETF stand for?', options: ['Exchange Traded Fund','Electronic Trading Fund','Equity Transfer Fund','Expense Tracking Fund'], correct: 0 },
        { question: 'What is an emergency fund?', options: ['Money for vacations','3-6 months of expenses saved','Investment portfolio','Credit card limit'], correct: 1 },
        { question: 'Which of the following is a liability?', options: ['Savings','Salary','Credit Card Debt','Equity'], correct: 2 },
        { question: 'APR refers to?', options: ['Annual Percentage Rate','Average Pay Rate','Annual Profit Ratio','Applied Payment Rate'], correct: 0 }
    ],
    budgeting: [
        { question: '50/30/20 rule allocates 20% to?', options: ['Wants','Needs','Savings/Debt payoff','Entertainment'], correct: 2 },
        { question: 'Zero-based budgeting means?', options: ['Spending all money','Every rupee is assigned a job','No savings','No expenses'], correct: 1 },
        { question: 'Which tool helps track categories best?', options: ['Random notes','Category envelopes','Guessing','None'], correct: 1 },
        { question: 'Best day to set budget?', options: ['Payday','End of month','Random','Never'], correct: 0 },
        { question: 'A sinking fund is for?', options: ['Daily coffee','Known future expense','Emergency only','Investing'], correct: 1 }
    ],
    investing: [
        { question: 'Diversification helps by?', options: ['Increasing risk','Eliminating taxes','Reducing risk','Doubling returns'], correct: 2 },
        { question: 'DCA stands for?', options: ['Dollar-Cost Averaging','Direct Cash Allocation','Debt Coverage Amount','Daily Capital Avg'], correct: 0 },
        { question: 'Index fund tracks?', options: ['A market index','Random picks','Crypto only','Gold only'], correct: 0 },
        { question: 'Time in market beats?', options: ['Luck','Timing the market','Leverage','Dividends'], correct: 1 },
        { question: 'Before investing you should have?', options: ['Car loan','New phone','Emergency fund','Travel plan'], correct: 2 }
    ],
    credit: [
        { question: 'Good credit utilization is under?', options: ['10%','30%','60%','90%'], correct: 1 },
        { question: 'Paying only minimum leads to?', options: ['No interest','Faster payoff','More interest','Rewards blocked'], correct: 2 },
        { question: 'Hard inquiry can?', options: ['Boost score','Lower score temporarily','No effect','Freeze account'], correct: 1 },
        { question: 'Longest factor in credit score?', options: ['Payment history','New credit','Credit mix','Length of history'], correct: 3 },
        { question: 'Best time to pay bill?', options: ['After due date','On due date','Before statement close','When reminder comes'], correct: 2 }
    ],
    crypto: [
        { question: 'Blockchain is a?', options: ['Central database','Distributed ledger','Bank','Spreadsheet'], correct: 1 },
        { question: 'Private key should be?', options: ['Shared','Written on wall','Kept secret','Emailed'], correct: 2 },
        { question: 'Bitcoin supply is?', options: ['Unlimited','21 million','Variable','Unknown'], correct: 1 },
        { question: 'Stablecoin aims to track?', options: ['Gold','Stocks','A fiat currency','Random index'], correct: 2 },
        { question: 'DYOR means?', options: ['Do Your Own Research','Don’t Yield On Risk','Dynamic Yield On Return','Daily Yearly Offset Rate'], correct: 0 }
    ]
};

let activeQuiz = [];

document.addEventListener('DOMContentLoaded', function() {
    const startQuizBtn = document.getElementById('startQuizBtn');
    const badgeCards = document.querySelectorAll('.badge-card');
    const domainSelect = document.getElementById('quizDomain');
    const lengthSelect = document.getElementById('quizLength');

    // Start Quiz Button
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', function() {
            const domain = domainSelect ? domainSelect.value : 'general';
            const length = lengthSelect ? parseInt(lengthSelect.value) : 10;
            startQuiz(domain, length);
        });
    }

    // Badge click handlers (for demo)
    badgeCards.forEach(card => {
        card.addEventListener('click', function() {
            const badge = this.dataset.badge;
            if (this.classList.contains('bg-white/5')) {
                // Locked badge - show message
                showBadgeMessage('This badge is locked. Complete more activities to unlock it!');
            } else {
                // Show badge info
                showBadgeInfo(badge);
            }
        });
    });

    updateXPProgress();
});

function startQuiz(domain = 'general', length = 10) {
    currentQuizQuestion = 0;
    quizScore = 0;
    activeQuiz = buildQuiz(domain, length);
    
    const startBtn = document.getElementById('startQuizBtn');
    const questionText = document.getElementById('questionText');
    const quizOptions = document.getElementById('quizOptions');
    const quizResult = document.getElementById('quizResult');

    startBtn.classList.add('hidden');
    quizResult.classList.add('hidden');
    
    displayQuestion();
}

function displayQuestion() {
    if (currentQuizQuestion >= activeQuiz.length) {
        endQuiz();
        return;
    }

    const question = activeQuiz[currentQuizQuestion];
    const questionText = document.getElementById('questionText');
    const quizOptions = document.getElementById('quizOptions');

    questionText.textContent = `Question ${currentQuizQuestion + 1}/${activeQuiz.length}: ${question.question}`;
    
    quizOptions.innerHTML = question.options.map((option, index) => {
        return `
            <button class="quiz-option w-full text-left bg-white/20 hover:bg-white/30 text-white p-4 rounded-lg transition duration-300 border border-white/30 hover:border-purple-500" 
                    data-option="${index}">
                ${option}
            </button>
        `;
    }).join('');

    // Add click handlers
    document.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', function() {
            const selectedOption = parseInt(this.dataset.option);
            handleAnswer(selectedOption);
        });
    });
}

function handleAnswer(selectedOption) {
    const question = activeQuiz[currentQuizQuestion];
    const options = document.querySelectorAll('.quiz-option');
    
    // Disable all options
    options.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
    });

    // Mark correct/incorrect
    if (selectedOption === question.correct) {
        options[selectedOption].classList.add('bg-green-500/50', 'border-green-500');
        quizScore++;
        showQuizFeedback('Correct! ✓', true);
    } else {
        options[selectedOption].classList.add('bg-red-500/50', 'border-red-500');
        options[question.correct].classList.add('bg-green-500/50', 'border-green-500');
        showQuizFeedback('Incorrect. The correct answer is highlighted.', false);
    }

    // Move to next question after delay
    setTimeout(() => {
        currentQuizQuestion++;
        displayQuestion();
    }, 2000);
}

function endQuiz() {
    const startBtn = document.getElementById('startQuizBtn');
    const questionText = document.getElementById('questionText');
    const quizOptions = document.getElementById('quizOptions');
    const quizResult = document.getElementById('quizResult');
    const resultText = document.getElementById('resultText');

    questionText.textContent = 'Quiz Completed!';
    quizOptions.innerHTML = '';

    const percentage = Math.round((quizScore / activeQuiz.length) * 100);
    const xpEarned = quizScore * 50; // 50 XP per correct answer
    
    userXP += xpEarned;
    updateXPProgress();

    let message = '';
    if (percentage === 100) {
        message = `🎉 Perfect score! You earned ${xpEarned} XP! 🎉`;
        triggerConfetti();
        checkBadgeUnlock();
    } else if (percentage >= 75) {
        message = `Great job! You scored ${quizScore}/${activeQuiz.length} (${percentage}%). You earned ${xpEarned} XP! ✨`;
        triggerConfetti();
    } else {
        message = `You scored ${quizScore}/${activeQuiz.length} (${percentage}%). You earned ${xpEarned} XP! Keep learning! 💪`;
    }

    resultText.textContent = message;
    quizResult.classList.remove('hidden');
    startBtn.textContent = 'Take Quiz Again 🔄';
    startBtn.classList.remove('hidden');
}

function buildQuiz(domain, length) {
    const bank = QUESTION_BANK[domain] && QUESTION_BANK[domain].length ? QUESTION_BANK[domain] : QUESTION_BANK.general;
    const recentKey = `quiz_recent_${domain}`;
    let recent = [];
    try { recent = JSON.parse(sessionStorage.getItem(recentKey) || '[]'); } catch (e) {}
    // Shuffle
    const shuffled = [...bank].sort(() => Math.random() - 0.5);
    // Prevent immediate repeats by filtering out questions matching strings in recent
    const filtered = shuffled.filter(q => !recent.includes(q.question));
    const needed = Math.max(1, Math.min(length, bank.length));
    let pick = filtered.slice(0, needed);
    if (pick.length < needed) {
        // add from the rest if filtered too much
        const rest = shuffled.filter(q => !pick.includes(q)).slice(0, needed - pick.length);
        pick = pick.concat(rest);
    }
    // Update recent cache (cap at 2x length)
    const newRecent = pick.map(q => q.question).concat(recent).slice(0, needed * 2);
    try { sessionStorage.setItem(recentKey, JSON.stringify(newRecent)); } catch (e) {}
    return pick;
}

function showQuizFeedback(message, isCorrect) {
    const quizResult = document.getElementById('quizResult');
    const resultText = document.getElementById('resultText');
    
    resultText.textContent = message;
    quizResult.className = isCorrect 
        ? 'mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg'
        : 'mt-4 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg';
    quizResult.classList.remove('hidden');

    setTimeout(() => {
        quizResult.classList.add('hidden');
    }, 2000);
}

function triggerConfetti() {
    // Use canvas-confetti library if available
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        
        // Trigger multiple bursts
        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0 }
            });
            confetti({
                particleCount: 50,
                angle: 120,
                spread: 55,
                origin: { x: 1 }
            });
        }, 250);
    }
}

function checkBadgeUnlock() {
    // Check if user has enough XP/activities to unlock new badges
    if (userXP >= 2000) {
        unlockBadge('investment-guru');
    }
    if (quizScore >= 3) {
        unlockBadge('quiz-champion');
    }
}

function unlockBadge(badgeName) {
    const badgeCard = document.querySelector(`[data-badge="${badgeName}"]`);
    if (badgeCard && badgeCard.classList.contains('bg-white/5')) {
        // Unlock the badge
        badgeCard.classList.remove('bg-white/5', 'border-white/10');
        badgeCard.classList.add('bg-gradient-to-br', 'from-purple-600/30', 'to-blue-600/30', 'border-purple-500/50');
        
        const icon = badgeCard.querySelector('.text-5xl');
        const statusText = badgeCard.querySelector('.text-xs');
        
        if (icon) icon.classList.remove('opacity-50');
        if (statusText) {
            statusText.classList.remove('text-purple-200/50');
            statusText.classList.add('text-purple-200');
            statusText.textContent = 'Unlocked!';
        }

        triggerConfetti();
        showBadgeMessage(`🎉 Badge Unlocked: ${badgeName.replace('-', ' ').toUpperCase()}! 🎉`);
    }
}

function showBadgeInfo(badgeName) {
    const badgeNames = {
        'smart-saver': 'Smart Saver - You\'ve mastered saving!',
        'budget-hero': 'Budget Hero - You\'re great at budgeting!',
        'stock-explorer': 'Stock Explorer - You know your investments!',
        'investment-guru': 'Investment Guru - Expert level investor!',
        'spending-master': 'Spending Master - You track everything!',
        'quiz-champion': 'Quiz Champion - Top quiz performer!'
    };

    showBadgeMessage(badgeNames[badgeName] || 'Badge information');
}

function showBadgeMessage(message) {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-full z-50 shadow-lg animate-fade-in';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translate(-50%, -20px)';
        notification.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function updateXPProgress() {
    const xpPerLevel = 250;
    const currentLevelXP = userXP % xpPerLevel;
    const progressPercentage = (currentLevelXP / xpPerLevel) * 100;
    const nextLevelXP = xpPerLevel - currentLevelXP;

    document.getElementById('userXP').textContent = userXP.toLocaleString();
    document.getElementById('userLevel').textContent = Math.floor(userXP / xpPerLevel) + 1;
    document.getElementById('nextLevelXP').textContent = nextLevelXP;
    
    const progressBar = document.getElementById('xpProgress');
    if (progressBar) {
        progressBar.style.width = `${progressPercentage}%`;
        const percentageText = progressBar.querySelector('span');
        if (percentageText) {
            percentageText.textContent = `${Math.round(progressPercentage)}%`;
        }
    }
}

