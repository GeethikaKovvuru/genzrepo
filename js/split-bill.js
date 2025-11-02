// Split Bill JavaScript
// Handles multi-step bill splitting flow

let currentStep = 1;
let selectedScenario = '';
let friends = [];
let items = [];
let friendListenersSetup = false;

document.addEventListener('DOMContentLoaded', function() {
    const scenarioButtons = document.querySelectorAll('.scenario-btn');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const generateFriendFieldsBtn = document.getElementById('generateFriendFields');
    const addItemBtn = document.getElementById('addItemBtn');
    const simulateOCRBtn = document.getElementById('simulateOCR');
    const sendNotificationsBtn = document.getElementById('sendNotifications');

    // Scenario Selection
    scenarioButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            selectedScenario = this.dataset.scenario;
            document.getElementById('selectedScenario').textContent = 
                selectedScenario.charAt(0).toUpperCase() + selectedScenario.slice(1);
            
            // Remove active class from all buttons
            scenarioButtons.forEach(b => b.classList.remove('ring-4', 'ring-purple-400'));
            // Add active class to clicked button
            this.classList.add('ring-4', 'ring-purple-400');
        });
    });

    // Generate Friend Fields
    if (generateFriendFieldsBtn) {
        generateFriendFieldsBtn.addEventListener('click', function() {
            const friendCount = parseInt(document.getElementById('friendCount').value) || 2;
            const friendFieldsContainer = document.getElementById('friendFields');
            friendFieldsContainer.innerHTML = '';
            friends = new Array(friendCount).fill(''); // Initialize array with empty strings

            for (let i = 0; i < friendCount; i++) {
                const friendDiv = document.createElement('div');
                friendDiv.className = 'bg-white/10 rounded-lg p-4';
                friendDiv.innerHTML = `
                    <label class="text-white mb-2 block">Friend ${i + 1} Name</label>
                    <input type="text" class="friend-name w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-white/50" placeholder="Enter name" data-index="${i}">
                `;
                friendFieldsContainer.appendChild(friendDiv);
            }

            // Set up event listeners for friend name inputs
            setupFriendNameListeners();
        });
    }

    // Add Item
    if (addItemBtn) {
        addItemBtn.addEventListener('click', function() {
            const itemName = document.getElementById('itemName').value.trim();
            const itemAmount = parseFloat(document.getElementById('itemAmount').value);
            const itemBuyer = document.getElementById('itemBuyer').value;
            
            // Get selected users (who is sharing/accessing)
            const selectedUsers = [];
            document.querySelectorAll('#itemUsers input[type="checkbox"]:checked').forEach(checkbox => {
                selectedUsers.push(checkbox.value);
            });

            if (!itemName || !itemAmount || !itemBuyer) {
                alert('Please fill in item name, amount, and select who paid!');
                return;
            }
            
            if (selectedUsers.length === 0) {
                alert('Please select at least one person who is sharing/accessing this item!');
                return;
            }

            items.push({
                name: itemName,
                amount: itemAmount,
                buyer: itemBuyer,
                users: selectedUsers // Who is sharing/accessing the item
            });

            // Add to items list display
            const itemsList = document.getElementById('itemsList');
            const itemDiv = document.createElement('div');
            itemDiv.className = 'bg-white/10 rounded-lg p-4 flex justify-between items-center';
            itemDiv.innerHTML = `
                <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-1">
                        <span class="text-white font-semibold">${itemName}</span>
                        <span class="text-purple-300">- ₹${itemAmount.toFixed(2)}</span>
                    </div>
                    <div class="text-sm text-blue-300">Paid by: ${itemBuyer}</div>
                    <div class="text-sm text-green-300">Shared by: ${selectedUsers.join(', ')}</div>
                </div>
                <button class="remove-item text-red-400 hover:text-red-300 transition ml-4" data-index="${items.length - 1}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            itemsList.appendChild(itemDiv);

            // Add remove functionality
            itemDiv.querySelector('.remove-item').addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                items.splice(index, 1);
                itemDiv.remove();
                updateItemsList();
            });

            // Clear inputs
            document.getElementById('itemName').value = '';
            document.getElementById('itemAmount').value = '';
            document.getElementById('itemBuyer').value = '';
            // Uncheck all checkboxes
            document.querySelectorAll('#itemUsers input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
        });
    }

    // Simulate OCR
    if (simulateOCRBtn) {
        simulateOCRBtn.addEventListener('click', function() {
            // Auto-fill some sample items
            const validFriends = friends.filter(f => f && f.trim());
            if (items.length === 0 && validFriends.length > 0) {
                const sampleItems = [
                    { 
                        name: 'Pizza', 
                        amount: 450, 
                        buyer: validFriends[0], 
                        users: validFriends.slice(0, Math.min(validFriends.length, 2)) // First 2 friends share
                    },
                    { 
                        name: 'Coke', 
                        amount: 120, 
                        buyer: validFriends[0], 
                        users: validFriends // All friends share
                    },
                    { 
                        name: 'Garlic Bread', 
                        amount: 180, 
                        buyer: validFriends[1] || validFriends[0], 
                        users: validFriends.slice(0, Math.min(validFriends.length, 2))
                    }
                ];

                sampleItems.forEach(item => {
                    items.push(item);
                });

                updateItemsList();
                document.getElementById('ocrResult').classList.remove('hidden');
                
                setTimeout(() => {
                    document.getElementById('ocrResult').classList.add('hidden');
                }, 3000);
            } else if (validFriends.length === 0) {
                alert('Please add friends first before using OCR simulation!');
            }
        });
    }

    // Next Button
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (validateCurrentStep()) {
                if (currentStep < 5) {
                    currentStep++;
                    updateStep();
                    if (currentStep === 5) {
                        calculateSummary();
                    }
                }
            }
        });
    }

    // Previous Button
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentStep > 1) {
                currentStep--;
                updateStep();
            }
        });
    }

    // Send Notifications
    if (sendNotificationsBtn) {
        sendNotificationsBtn.addEventListener('click', function() {
            document.getElementById('notificationAlert').classList.remove('hidden');
            this.disabled = true;
            this.textContent = '✅ Notifications Sent!';
            
            setTimeout(() => {
                this.disabled = false;
                this.textContent = '📤 Send Notifications to Friends';
            }, 3000);
        });
    }

    // Set up event listeners for friend name inputs (only once)
    function setupFriendNameListeners() {
        // Use event delegation to avoid duplicate listeners
        const friendFieldsContainer = document.getElementById('friendFields');
        if (!friendFieldsContainer) return;
        
        // Only set up listeners once, or remove old ones before adding new
        if (!friendListenersSetup) {
            // Input event handler
            friendFieldsContainer.addEventListener('input', function(e) {
                if (e.target.classList.contains('friend-name')) {
                    const index = parseInt(e.target.dataset.index);
                    if (!isNaN(index)) {
                        friends[index] = e.target.value.trim();
                        updateBuyerDropdown();
                    }
                }
            });

            // Blur event handler
            friendFieldsContainer.addEventListener('blur', function(e) {
                if (e.target.classList.contains('friend-name')) {
                    const index = parseInt(e.target.dataset.index);
                    if (!isNaN(index)) {
                        friends[index] = e.target.value.trim();
                        updateBuyerDropdown();
                    }
                }
            }, true); // Use capture phase
            
            friendListenersSetup = true;
        }
        
        // Initial dropdown update
        updateBuyerDropdown();
    }

    // Update buyer dropdown when friends are added
    function updateBuyerDropdown() {
        const buyerSelect = document.getElementById('itemBuyer');
        if (!buyerSelect) return;
        
        buyerSelect.innerHTML = '<option value="" style="color: #1f2937; background: white;">Select Buyer</option>';
        
        // Only add friends that have names entered
        const validFriends = friends.filter(friend => friend && friend.trim());
        validFriends.forEach(friend => {
            const option = document.createElement('option');
            option.value = friend.trim();
            option.textContent = friend.trim();
            option.style.color = 'white';
            option.style.background = 'rgba(255, 255, 255, 0.2)';
            buyerSelect.appendChild(option);
        });
        
        // Also update the item users checkboxes
        updateItemUsersCheckboxes();
    }
    
    // Update checkboxes for who is sharing/accessing items
    function updateItemUsersCheckboxes() {
        const itemUsersContainer = document.getElementById('itemUsers');
        if (!itemUsersContainer) return;
        
        const validFriends = friends.filter(friend => friend && friend.trim());
        
        if (validFriends.length === 0) {
            itemUsersContainer.innerHTML = '<p class="text-purple-200 text-sm">Add friends first to see sharing options</p>';
            return;
        }
        
        itemUsersContainer.innerHTML = validFriends.map(friend => {
            return `
                <label class="flex items-center space-x-2 cursor-pointer hover:bg-white/10 p-2 rounded transition">
                    <input type="checkbox" value="${friend.trim()}" class="w-5 h-5 rounded border-white/30 bg-white/20 text-purple-600 focus:ring-purple-500 focus:ring-2">
                    <span class="text-white">${friend.trim()}</span>
                </label>
            `;
        }).join('');
    }

    function updateItemsList() {
        const itemsList = document.getElementById('itemsList');
        itemsList.innerHTML = '';

        items.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'bg-white/10 rounded-lg p-4 flex justify-between items-center';
            
            const sharedBy = item.users && item.users.length > 0 ? item.users.join(', ') : 'No one';
            
            itemDiv.innerHTML = `
                <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-1">
                        <span class="text-white font-semibold">${item.name}</span>
                        <span class="text-purple-300">- ₹${item.amount.toFixed(2)}</span>
                    </div>
                    <div class="text-sm text-blue-300">Paid by: ${item.buyer || 'Unknown'}</div>
                    <div class="text-sm text-green-300">Shared by: ${sharedBy}</div>
                </div>
                <button class="remove-item text-red-400 hover:text-red-300 transition ml-4" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            itemsList.appendChild(itemDiv);

            itemDiv.querySelector('.remove-item').addEventListener('click', function() {
                const idx = parseInt(this.dataset.index);
                items.splice(idx, 1);
                updateItemsList();
            });
        });
    }

    function validateCurrentStep() {
        switch (currentStep) {
            case 1:
                if (!selectedScenario) {
                    alert('Please select a scenario!');
                    return false;
                }
                return true;
            case 2:
                const friendCount = parseInt(document.getElementById('friendCount').value) || 0;
                if (friendCount < 1) {
                    alert('Please enter at least 1 friend!');
                    return false;
                }
                
                // Check if friend fields have been generated
                const friendInputs = document.querySelectorAll('.friend-name');
                if (friendInputs.length === 0) {
                    alert('Please click "Generate Fields" to create friend name inputs!');
                    return false;
                }
                
                // Check if at least some friends have names
                const filledFriends = Array.from(friendInputs).filter(input => input.value.trim()).length;
                if (filledFriends === 0) {
                    alert('Please enter at least one friend name!');
                    return false;
                }
                
                // Update friends array from inputs
                friendInputs.forEach((input, index) => {
                    friends[index] = input.value.trim();
                });
                
                // Filter out empty names for validation
                const validFriends = friends.filter(f => f && f.trim());
                if (validFriends.length === 0) {
                    alert('Please enter at least one friend name!');
                    return false;
                }
                
                return true;
            case 3:
                if (items.length === 0) {
                    alert('Please add at least one item!');
                    return false;
                }
                return true;
            default:
                return true;
        }
    }

    function updateStep() {
        // Hide all steps
        document.querySelectorAll('.step-content').forEach(step => {
            step.classList.add('hidden');
        });

        // Show current step
        document.getElementById(`step${currentStep}`).classList.remove('hidden');

        // Update progress indicators
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            const stepNum = index + 1;
            indicator.classList.remove('active', 'completed');
            
            if (stepNum < currentStep) {
                indicator.classList.add('completed');
            } else if (stepNum === currentStep) {
                indicator.classList.add('active');
            }
        });

        // Update buttons
        prevBtn.classList.toggle('hidden', currentStep === 1);
        
        if (currentStep === 5) {
            nextBtn.classList.add('hidden');
        } else {
            nextBtn.classList.remove('hidden');
        }
    }

    function calculateSummary() {
        const summaryBody = document.getElementById('summaryBody');
        summaryBody.innerHTML = '';

        // Initialize tracking objects - only for valid friends
        const validFriends = friends.filter(f => f && f.trim());
        const paidAmount = {}; // What each person paid
        const owesAmount = {}; // What each person owes (from items they shared)
        
        validFriends.forEach(friend => {
            paidAmount[friend] = 0;
            owesAmount[friend] = 0;
        });

        let grandTotal = 0;

        // Process each item
        items.forEach(item => {
            grandTotal += item.amount;
            
            // Track who paid
            if (paidAmount[item.buyer] !== undefined) {
                paidAmount[item.buyer] += item.amount;
            }
            
            // Split the item cost among users who are sharing it
            if (item.users && item.users.length > 0) {
                const costPerPerson = item.amount / item.users.length;
                
                item.users.forEach(user => {
                    if (owesAmount[user] !== undefined) {
                        owesAmount[user] += costPerPerson;
                    }
                });
            }
        });

        // Calculate net amount for each person (what they paid - what they owe)
        validFriends.forEach(friend => {
            const paid = paidAmount[friend] || 0;
            const owes = owesAmount[friend] || 0;
            const net = paid - owes;

            const row = document.createElement('tr');
            row.className = 'border-b border-white/10';
            
            if (net > 0) {
                // They paid more than they owe - they should get money back
                row.innerHTML = `
                    <td class="p-4 text-white font-semibold">${friend}</td>
                    <td class="p-4 text-right">
                        <div class="text-green-300 font-semibold">Gets ₹${net.toFixed(2)}</div>
                        <div class="text-xs text-white/60 mt-1">Paid: ₹${paid.toFixed(2)} | Owed: ₹${owes.toFixed(2)}</div>
                    </td>
                `;
            } else if (net < 0) {
                // They owe more than they paid - they need to pay
                row.innerHTML = `
                    <td class="p-4 text-white font-semibold">${friend}</td>
                    <td class="p-4 text-right">
                        <div class="text-red-300 font-semibold">Owes ₹${Math.abs(net).toFixed(2)}</div>
                        <div class="text-xs text-white/60 mt-1">Paid: ₹${paid.toFixed(2)} | Owed: ₹${owes.toFixed(2)}</div>
                    </td>
                `;
            } else {
                // Exactly balanced
                row.innerHTML = `
                    <td class="p-4 text-white font-semibold">${friend}</td>
                    <td class="p-4 text-right">
                        <div class="text-green-300 font-semibold">Settled ✓</div>
                        <div class="text-xs text-white/60 mt-1">Paid: ₹${paid.toFixed(2)} | Owed: ₹${owes.toFixed(2)}</div>
                    </td>
                `;
            }
            
            summaryBody.appendChild(row);
        });

        document.getElementById('grandTotal').textContent = `₹${grandTotal.toFixed(2)}`;
    }
});

