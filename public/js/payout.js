// Payout functionality for EARNLANG

let payoutHistory = [];
let payoutStats = {};

document.addEventListener('DOMContentLoaded', () => {
    const { AuthGuard, Loading, Notification } = window.EarnLangUtils;
    
    // Check authentication
    if (!AuthGuard.checkAuth()) return;
    
    initPayout();
});

function initPayout() {
    const { UserManager } = window.EarnLangUtils;
    
    // Load user data
    const user = UserManager.getUser();
    if (user) {
        updateUserInfo(user);
    }
    
    // Load payout data
    loadPayoutData();
    
    // Initialize event listeners
    initEventListeners();
    
    // Auto-refresh every 60 seconds
    setInterval(loadPayoutData, 60000);
}

function updateUserInfo(user) {
    const usernameEl = document.getElementById('username');
    const pointsEl = document.getElementById('userPoints');
    
    if (usernameEl) {
        usernameEl.textContent = user.username;
    }
    
    if (pointsEl) {
        pointsEl.textContent = Format.formatPoints(user.points);
    }
}

async function loadPayoutData() {
    const { API, Loading, Notification } = window.EarnLangUtils;
    
    try {
        Loading.show('Loading payout data...');
        
        // Load payout history and stats in parallel
        const [historyResponse, statsResponse] = await Promise.all([
            API.get('/payouts/history'),
            API.get('/payouts/stats')
        ]);
        
        payoutHistory = historyResponse;
        payoutStats = statsResponse;
        
        // Update UI
        updatePayoutDisplay();
        updatePayoutHistory();
        updatePayoutStats();
        
    } catch (error) {
        console.error('Error loading payout data:', error);
        Notification.error('Failed to load payout data');
    } finally {
        Loading.hide();
    }
}

function updatePayoutDisplay() {
    const { UserManager } = window.EarnLangUtils;
    
    const user = UserManager.getUser();
    if (!user) return;
    
    // Update balance information
    const availablePointsEl = document.getElementById('availablePoints');
    const cashValueEl = document.getElementById('cashValue');
    
    if (availablePointsEl) {
        availablePointsEl.textContent = Format.formatPoints(user.points);
    }
    
    if (cashValueEl) {
        const cashValue = user.points / 10; // 10 points = ₱1
        cashValueEl.textContent = Format.formatCurrency(cashValue);
    }
}

function updatePayoutHistory() {
    const payoutHistoryEl = document.getElementById('payoutHistory');
    if (!payoutHistoryEl) return;
    
    payoutHistoryEl.innerHTML = '';
    
    if (payoutHistory.length === 0) {
        payoutHistoryEl.innerHTML = '<p class="no-history">No payout history</p>';
        return;
    }
    
    payoutHistory.forEach(payout => {
        const historyItem = document.createElement('div');
        historyItem.className = 'payout-history-item';
        
        const statusClass = getPayoutStatusClass(payout.status);
        const statusIcon = getPayoutStatusIcon(payout.status);
        
        historyItem.innerHTML = `
            <div class="payout-info">
                <div class="payout-header">
                    <h4>₱${payout.amount} to ${payout.gcashNumber}</h4>
                    <span class="payout-status ${statusClass}">
                        <i class="${statusIcon}"></i>
                        ${payout.status}
                    </span>
                </div>
                <div class="payout-details">
                    <span>${payout.pointsUsed} points used</span>
                    <span>${Format.formatDate(payout.requestedAt)}</span>
                </div>
                ${payout.notes ? `<div class="payout-notes">${payout.notes}</div>` : ''}
            </div>
            ${payout.status === 'pending' ? `
                <button class="btn-secondary cancel-payout" data-payout-id="${payout._id}">
                    Cancel
                </button>
            ` : ''}
        `;
        
        // Add cancel button event listener
        const cancelBtn = historyItem.querySelector('.cancel-payout');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                cancelPayout(payout._id);
            });
        }
        
        payoutHistoryEl.appendChild(historyItem);
    });
}

function updatePayoutStats() {
    // Update stats cards
    const pendingPayoutsEl = document.getElementById('pendingPayouts');
    const completedPayoutsEl = document.getElementById('completedPayouts');
    const totalPaidOutEl = document.getElementById('totalPaidOut');
    const lastPayoutEl = document.getElementById('lastPayout');
    
    if (pendingPayoutsEl) {
        const pendingCount = payoutStats.byStatus?.find(s => s._id === 'pending')?.count || 0;
        pendingPayoutsEl.textContent = pendingCount;
    }
    
    if (completedPayoutsEl) {
        const completedCount = payoutStats.byStatus?.find(s => s._id === 'completed')?.count || 0;
        completedPayoutsEl.textContent = completedCount;
    }
    
    if (totalPaidOutEl) {
        totalPaidOutEl.textContent = Format.formatCurrency(payoutStats.totalCompleted || 0);
    }
    
    if (lastPayoutEl) {
        const lastPayout = payoutHistory.find(p => p.status === 'completed');
        if (lastPayout) {
            lastPayoutEl.textContent = Format.formatDate(lastPayout.processedAt);
        } else {
            lastPayoutEl.textContent = 'No payouts yet';
        }
    }
}

function getPayoutStatusClass(status) {
    switch (status) {
        case 'completed': return 'success';
        case 'pending': return 'warning';
        case 'rejected': return 'error';
        default: return '';
    }
}

function getPayoutStatusIcon(status) {
    switch (status) {
        case 'completed': return 'fas fa-check-circle';
        case 'pending': return 'fas fa-clock';
        case 'rejected': return 'fas fa-times-circle';
        default: return 'fas fa-question-circle';
    }
}

function initEventListeners() {
    const { Notification, Modal } = window.EarnLangUtils;
    
    // Payout form
    const payoutForm = document.getElementById('payoutForm');
    if (payoutForm) {
        payoutForm.addEventListener('submit', handlePayoutRequest);
    }
    
    // Amount input change
    const payoutAmountEl = document.getElementById('payoutAmount');
    if (payoutAmountEl) {
        payoutAmountEl.addEventListener('input', updatePointsRequired);
    }
    
    // Payout confirmation modal
    const confirmPayoutBtn = document.getElementById('confirmPayoutBtn');
    const cancelPayoutBtn = document.getElementById('cancelPayout');
    
    if (confirmPayoutBtn) {
        confirmPayoutBtn.addEventListener('click', submitPayoutRequest);
    }
    
    if (cancelPayoutBtn) {
        cancelPayoutBtn.addEventListener('click', () => {
            Modal.hide('payoutConfirmModal');
        });
    }
    
    // History filter
    const historyFilter = document.getElementById('historyFilter');
    if (historyFilter) {
        historyFilter.addEventListener('change', filterPayoutHistory);
    }
    
    // User dropdown
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', () => {
            userDropdown.classList.toggle('hidden');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            AuthGuard.logout();
        });
    }
}

function updatePointsRequired() {
    const { Validation } = window.EarnLangUtils;
    
    const amountEl = document.getElementById('payoutAmount');
    const pointsRequiredEl = document.getElementById('pointsRequired');
    
    if (!amountEl || !pointsRequiredEl) return;
    
    const amount = parseFloat(amountEl.value) || 0;
    const pointsRequired = amount * 10; // 10 points = ₱1
    
    pointsRequiredEl.value = Format.formatPoints(pointsRequired);
    
    // Validate amount
    if (amount < 50) {
        amountEl.setCustomValidity('Minimum payout amount is ₱50');
    } else if (amount > 10000) {
        amountEl.setCustomValidity('Maximum payout amount is ₱10,000');
    } else {
        amountEl.setCustomValidity('');
    }
}

async function handlePayoutRequest(e) {
    e.preventDefault();
    const { Validation, Notification, Modal } = window.EarnLangUtils;
    
    const gcashNumber = document.getElementById('gcashNumber').value.trim();
    const amount = parseFloat(document.getElementById('payoutAmount').value);
    const confirmPayout = document.getElementById('confirmPayout').checked;
    
    // Validation
    if (!gcashNumber || !amount) {
        Notification.error('Please fill in all fields');
        return;
    }
    
    if (!Validation.isValidGCashNumber(gcashNumber)) {
        Notification.error('Please enter a valid GCash number (09XXXXXXXXX)');
        return;
    }
    
    if (amount < 50) {
        Notification.error('Minimum payout amount is ₱50');
        return;
    }
    
    if (amount > 10000) {
        Notification.error('Maximum payout amount is ₱10,000');
        return;
    }
    
    if (!confirmPayout) {
        Notification.error('Please confirm that the GCash number is correct');
        return;
    }
    
    // Show confirmation modal
    showPayoutConfirmation(gcashNumber, amount);
}

function showPayoutConfirmation(gcashNumber, amount) {
    const { Modal } = window.EarnLangUtils;
    
    const confirmGcashNumberEl = document.getElementById('confirmGcashNumber');
    const confirmAmountEl = document.getElementById('confirmAmount');
    const confirmPointsEl = document.getElementById('confirmPoints');
    
    if (confirmGcashNumberEl) {
        confirmGcashNumberEl.textContent = gcashNumber;
    }
    
    if (confirmAmountEl) {
        confirmAmountEl.textContent = Format.formatCurrency(amount);
    }
    
    if (confirmPointsEl) {
        confirmPointsEl.textContent = Format.formatPoints(amount * 10);
    }
    
    Modal.show('payoutConfirmModal');
}

async function submitPayoutRequest() {
    const { API, Notification, Loading, Modal, UserManager } = window.EarnLangUtils;
    
    const gcashNumber = document.getElementById('gcashNumber').value.trim();
    const amount = parseFloat(document.getElementById('payoutAmount').value);
    
    Loading.show('Submitting payout request...');
    
    try {
        const response = await API.post('/payouts/request', {
            gcashNumber,
            amount
        });
        
        // Update user points
        const user = UserManager.getUser();
        if (user) {
            UserManager.updateUser({ points: response.newBalance });
            updateUserInfo({ ...user, points: response.newBalance });
        }
        
        Notification.success('Payout request submitted successfully!');
        Modal.hide('payoutConfirmModal');
        
        // Reset form
        document.getElementById('payoutForm').reset();
        document.getElementById('pointsRequired').value = '';
        
        // Reload payout data
        loadPayoutData();
        
    } catch (error) {
        Notification.error(error.message || 'Failed to submit payout request');
    } finally {
        Loading.hide();
    }
}

async function cancelPayout(payoutId) {
    const { API, Notification, Loading, UserManager } = window.EarnLangUtils;
    
    if (!confirm('Are you sure you want to cancel this payout request?')) {
        return;
    }
    
    Loading.show('Cancelling payout...');
    
    try {
        const response = await API.post(`/payouts/cancel/${payoutId}`);
        
        // Update user points
        const user = UserManager.getUser();
        if (user) {
            UserManager.updateUser({ points: response.newBalance });
            updateUserInfo({ ...user, points: response.newBalance });
        }
        
        Notification.success('Payout cancelled successfully');
        
        // Reload payout data
        loadPayoutData();
        
    } catch (error) {
        Notification.error(error.message || 'Failed to cancel payout');
    } finally {
        Loading.hide();
    }
}

function filterPayoutHistory() {
    const filter = document.getElementById('historyFilter').value;
    const payoutHistoryEl = document.getElementById('payoutHistory');
    
    if (!payoutHistoryEl) return;
    
    const filteredHistory = filter === 'all' 
        ? payoutHistory 
        : payoutHistory.filter(payout => payout.status === filter);
    
    // Re-render filtered history
    payoutHistoryEl.innerHTML = '';
    
    if (filteredHistory.length === 0) {
        payoutHistoryEl.innerHTML = '<p class="no-history">No payouts found</p>';
        return;
    }
    
    filteredHistory.forEach(payout => {
        const historyItem = document.createElement('div');
        historyItem.className = 'payout-history-item';
        
        const statusClass = getPayoutStatusClass(payout.status);
        const statusIcon = getPayoutStatusIcon(payout.status);
        
        historyItem.innerHTML = `
            <div class="payout-info">
                <div class="payout-header">
                    <h4>₱${payout.amount} to ${payout.gcashNumber}</h4>
                    <span class="payout-status ${statusClass}">
                        <i class="${statusIcon}"></i>
                        ${payout.status}
                    </span>
                </div>
                <div class="payout-details">
                    <span>${payout.pointsUsed} points used</span>
                    <span>${Format.formatDate(payout.requestedAt)}</span>
                </div>
                ${payout.notes ? `<div class="payout-notes">${payout.notes}</div>` : ''}
            </div>
            ${payout.status === 'pending' ? `
                <button class="btn-secondary cancel-payout" data-payout-id="${payout._id}">
                    Cancel
                </button>
            ` : ''}
        `;
        
        // Add cancel button event listener
        const cancelBtn = historyItem.querySelector('.cancel-payout');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                cancelPayout(payout._id);
            });
        }
        
        payoutHistoryEl.appendChild(historyItem);
    });
}

// Check for pending payouts on page load
function checkPendingPayouts() {
    const pendingPayout = payoutHistory.find(p => p.status === 'pending');
    
    if (pendingPayout) {
        const { Notification } = window.EarnLangUtils;
        Notification.warning('You have a pending payout request. Please wait for processing.');
    }
}

// Initialize pending payout check
setTimeout(checkPendingPayouts, 2000); 