// Profile functionality for EARNLANG

let userProfile = null;
let taskHistory = [];
let payoutHistory = [];
let referralData = null;

document.addEventListener('DOMContentLoaded', () => {
    const { AuthGuard, Loading, Notification } = window.EarnLangUtils;
    
    // Check authentication
    if (!AuthGuard.checkAuth()) return;
    
    initProfile();
});

function initProfile() {
    const { UserManager, TabManager } = window.EarnLangUtils;
    
    // Load user data
    const user = UserManager.getUser();
    if (user) {
        updateUserInfo(user);
    }
    
    // Load profile data
    loadProfileData();
    
    // Initialize tabs
    TabManager.init('.profile-tabs');
    
    // Initialize event listeners
    initEventListeners();
}

function updateUserInfo(user) {
    const usernameEl = document.getElementById('username');
    const pointsEl = document.getElementById('userPoints');
    const profileUsernameEl = document.getElementById('profileUsername');
    const profileEmailEl = document.getElementById('profileEmail');
    
    if (usernameEl) {
        usernameEl.textContent = user.username;
    }
    
    if (pointsEl) {
        pointsEl.textContent = Format.formatPoints(user.points);
    }
    
    if (profileUsernameEl) {
        profileUsernameEl.textContent = user.username;
    }
    
    if (profileEmailEl) {
        profileEmailEl.textContent = user.email;
    }
}

async function loadProfileData() {
    const { API, Loading, Notification } = window.EarnLangUtils;
    
    try {
        Loading.show('Loading profile...');
        
        // Load profile data
        const response = await API.get('/user/profile');
        
        userProfile = response.user;
        taskHistory = response.taskHistory || [];
        payoutHistory = response.payoutHistory || [];
        
        // Update UI
        updateProfileDisplay();
        updateTaskHistory();
        updatePayoutHistory();
        
        // Load additional data
        await Promise.all([
            loadUserStats(),
            loadReferralData()
        ]);
        
    } catch (error) {
        console.error('Error loading profile data:', error);
        Notification.error('Failed to load profile data');
    } finally {
        Loading.hide();
    }
}

function updateProfileDisplay() {
    if (!userProfile) return;
    
    // Update profile stats
    const totalPointsEarnedEl = document.getElementById('totalPointsEarned');
    const totalTasksCompletedEl = document.getElementById('totalTasksCompleted');
    const memberSinceEl = document.getElementById('memberSince');
    const emailStatusEl = document.getElementById('emailStatus');
    const accountStatusEl = document.getElementById('accountStatus');
    const lastLoginEl = document.getElementById('lastLogin');
    
    if (totalPointsEarnedEl) {
        totalPointsEarnedEl.textContent = Format.formatPoints(userProfile.totalPointsEarned || 0);
    }
    
    if (totalTasksCompletedEl) {
        totalTasksCompletedEl.textContent = taskHistory.length;
    }
    
    if (memberSinceEl) {
        memberSinceEl.textContent = Format.formatDate(userProfile.createdAt);
    }
    
    if (emailStatusEl) {
        const isVerified = userProfile.isVerified;
        emailStatusEl.innerHTML = isVerified 
            ? '<i class="fas fa-check-circle verified"></i> Verified'
            : '<i class="fas fa-times-circle unverified"></i> Unverified';
    }
    
    if (accountStatusEl) {
        const isBanned = userProfile.isBanned;
        accountStatusEl.innerHTML = isBanned
            ? '<i class="fas fa-ban banned"></i> Banned'
            : '<i class="fas fa-check-circle active"></i> Active';
    }
    
    if (lastLoginEl) {
        lastLoginEl.textContent = Format.formatRelativeTime(userProfile.lastLogin);
    }
}

async function loadUserStats() {
    const { API } = window.EarnLangUtils;
    
    try {
        const stats = await API.get('/user/stats');
        updateStatsDisplay(stats);
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}

function updateStatsDisplay(stats) {
    // Update earnings summary
    const totalEarnedEl = document.getElementById('totalEarned');
    const totalPaidOutEl = document.getElementById('totalPaidOut');
    const pendingPayoutsEl = document.getElementById('pendingPayouts');
    
    if (totalEarnedEl) {
        totalEarnedEl.textContent = Format.formatCurrency(stats.taskStats.totalPoints / 10);
    }
    
    if (totalPaidOutEl) {
        const completedPayouts = stats.payoutStats.find(s => s._id === 'completed');
        totalPaidOutEl.textContent = Format.formatCurrency(completedPayouts?.totalAmount || 0);
    }
    
    if (pendingPayoutsEl) {
        const pendingPayouts = stats.payoutStats.find(s => s._id === 'pending');
        pendingPayoutsEl.textContent = Format.formatCurrency(pendingPayouts?.totalAmount || 0);
    }
    
    // Update recent activity
    updateRecentActivity(stats.recentActivity);
}

function updateRecentActivity(activity) {
    const recentActivityEl = document.getElementById('recentActivity');
    if (!recentActivityEl) return;
    
    recentActivityEl.innerHTML = '';
    
    if (!activity || activity.length === 0) {
        recentActivityEl.innerHTML = '<p class="no-activity">No recent activity</p>';
        return;
    }
    
    activity.forEach(item => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="activity-content">
                <h4>${item.taskTitle}</h4>
                <p>+${item.pointsEarned} points</p>
            </div>
            <div class="activity-time">
                ${Format.formatRelativeTime(item.completedAt)}
            </div>
        `;
        
        recentActivityEl.appendChild(activityItem);
    });
}

function updateTaskHistory() {
    const taskHistoryEl = document.getElementById('taskHistory');
    if (!taskHistoryEl) return;
    
    taskHistoryEl.innerHTML = '';
    
    if (taskHistory.length === 0) {
        taskHistoryEl.innerHTML = '<p class="no-history">No task history</p>';
        return;
    }
    
    taskHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        historyItem.innerHTML = `
            <div class="history-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="history-content">
                <h4>${item.taskTitle}</h4>
                <p>+${item.pointsEarned} points earned</p>
            </div>
            <div class="history-time">
                ${Format.formatDate(item.completedAt)}
            </div>
        `;
        
        taskHistoryEl.appendChild(historyItem);
    });
}

function updatePayoutHistory() {
    const payoutHistoryEl = document.getElementById('payoutHistory');
    if (!payoutHistoryEl) return;
    
    payoutHistoryEl.innerHTML = '';
    
    if (payoutHistory.length === 0) {
        payoutHistoryEl.innerHTML = '<p class="no-history">No payout history</p>';
        return;
    }
    
    payoutHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const statusClass = getStatusClass(item.status);
        const statusIcon = getStatusIcon(item.status);
        
        historyItem.innerHTML = `
            <div class="history-icon ${statusClass}">
                <i class="${statusIcon}"></i>
            </div>
            <div class="history-content">
                <h4>₱${item.amount} to ${item.gcashNumber}</h4>
                <p>${item.pointsUsed} points used</p>
            </div>
            <div class="history-status">
                <span class="status-badge ${statusClass}">${item.status}</span>
                <div class="history-time">${Format.formatDate(item.requestedAt)}</div>
            </div>
        `;
        
        payoutHistoryEl.appendChild(historyItem);
    });
}

function getStatusClass(status) {
    switch (status) {
        case 'completed': return 'success';
        case 'pending': return 'warning';
        case 'rejected': return 'error';
        default: return '';
    }
}

function getStatusIcon(status) {
    switch (status) {
        case 'completed': return 'fas fa-check-circle';
        case 'pending': return 'fas fa-clock';
        case 'rejected': return 'fas fa-times-circle';
        default: return 'fas fa-question-circle';
    }
}

async function loadReferralData() {
    const { API } = window.EarnLangUtils;
    
    try {
        const referralInfo = await API.get('/user/referral');
        referralData = referralInfo;
        updateReferralDisplay();
    } catch (error) {
        console.error('Error loading referral data:', error);
    }
}

function updateReferralDisplay() {
    if (!referralData) return;
    
    // Update referral code
    const referralCodeEl = document.getElementById('referralCode');
    if (referralCodeEl) {
        referralCodeEl.value = referralData.referralCode;
    }
    
    // Update referral stats
    const referralCountEl = document.getElementById('referralCount');
    const referralEarningsEl = document.getElementById('referralEarnings');
    
    if (referralCountEl) {
        referralCountEl.textContent = referralData.referralCount || 0;
    }
    
    if (referralEarningsEl) {
        // Calculate earnings from referrals (assuming 50 points per referral)
        const earnings = (referralData.referralCount || 0) * 50;
        referralEarningsEl.textContent = Format.formatPoints(earnings);
    }
    
    // Update referred users list
    updateReferredUsers(referralData.referredUsers || []);
}

function updateReferredUsers(users) {
    const referredUsersEl = document.getElementById('referredUsers');
    if (!referredUsersEl) return;
    
    referredUsersEl.innerHTML = '';
    
    if (users.length === 0) {
        referredUsersEl.innerHTML = '<p class="no-users">No referred users yet</p>';
        return;
    }
    
    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        
        userItem.innerHTML = `
            <div class="user-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-info">
                <h4>${user.username}</h4>
                <p>Joined ${Format.formatDate(user.createdAt)}</p>
            </div>
        `;
        
        referredUsersEl.appendChild(userItem);
    });
}

function initEventListeners() {
    const { Notification, Modal } = window.EarnLangUtils;
    
    // Edit profile button
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            showEditProfileModal();
        });
    }
    
    // Edit profile form
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', handleEditProfile);
    }
    
    // Cancel edit button
    const cancelEditBtn = document.getElementById('cancelEdit');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            Modal.hide('editProfileModal');
        });
    }
    
    // Copy referral code button
    const copyReferralBtn = document.getElementById('copyReferralBtn');
    if (copyReferralBtn) {
        copyReferralBtn.addEventListener('click', copyReferralCode);
    }
    
    // Filter dropdowns
    const taskFilter = document.getElementById('taskFilter');
    if (taskFilter) {
        taskFilter.addEventListener('change', filterTaskHistory);
    }
    
    const payoutFilter = document.getElementById('payoutFilter');
    if (payoutFilter) {
        payoutFilter.addEventListener('change', filterPayoutHistory);
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

function showEditProfileModal() {
    const { Modal } = window.EarnLangUtils;
    
    if (!userProfile) return;
    
    const editUsernameEl = document.getElementById('editUsername');
    const editEmailEl = document.getElementById('editEmail');
    
    if (editUsernameEl) {
        editUsernameEl.value = userProfile.username;
    }
    
    if (editEmailEl) {
        editEmailEl.value = userProfile.email;
    }
    
    Modal.show('editProfileModal');
}

async function handleEditProfile(e) {
    e.preventDefault();
    const { API, Notification, Loading, Modal, UserManager } = window.EarnLangUtils;
    
    const username = document.getElementById('editUsername').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const currentPassword = document.getElementById('currentPassword').value;
    
    if (!username || !email || !currentPassword) {
        Notification.error('Please fill in all fields');
        return;
    }
    
    Loading.show('Updating profile...');
    
    try {
        const response = await API.put('/user/profile', {
            username,
            email,
            currentPassword
        });
        
        // Update user data
        UserManager.updateUser(response.user);
        updateUserInfo(response.user);
        
        Notification.success('Profile updated successfully');
        Modal.hide('editProfileModal');
        
        // Reload profile data
        loadProfileData();
        
    } catch (error) {
        Notification.error(error.message || 'Failed to update profile');
    } finally {
        Loading.hide();
    }
}

function copyReferralCode() {
    const { Notification } = window.EarnLangUtils;
    
    const referralCodeEl = document.getElementById('referralCode');
    if (!referralCodeEl || !referralData) return;
    
    navigator.clipboard.writeText(referralData.referralCode).then(() => {
        Notification.success('Referral code copied to clipboard!');
    }).catch(() => {
        Notification.error('Failed to copy referral code');
    });
}

function filterTaskHistory() {
    const filter = document.getElementById('taskFilter').value;
    // Implement task history filtering based on selected filter
    console.log('Filtering task history by:', filter);
}

function filterPayoutHistory() {
    const filter = document.getElementById('payoutFilter').value;
    // Implement payout history filtering based on selected filter
    console.log('Filtering payout history by:', filter);
} 