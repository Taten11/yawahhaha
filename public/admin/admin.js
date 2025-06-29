// Admin functionality for EARNLANG

let adminData = null;
let dashboardStats = {};

document.addEventListener('DOMContentLoaded', () => {
    const { AuthGuard, Loading, Notification } = window.EarnLangUtils;
    
    // Check if this is admin login page
    if (window.location.pathname.includes('admin-login.html')) {
        initAdminLogin();
    } else {
        // Check admin authentication for other admin pages
        if (!checkAdminAuth()) {
            window.location.href = 'admin-login.html';
            return;
        }
        
        initAdminDashboard();
    }
});

function initAdminLogin() {
    const { API, Notification, Loading } = window.EarnLangUtils;
    
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }
}

async function handleAdminLogin(e) {
    e.preventDefault();
    const { API, Notification, Loading } = window.EarnLangUtils;
    
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    
    if (!email || !password) {
        Notification.error('Please fill in all fields');
        return;
    }
    
    Loading.show('Authenticating...');
    
    try {
        const response = await API.post('/auth/login', {
            email,
            password
        });
        
        // Check if user is admin
        if (!response.user.isAdmin) {
            throw new Error('Access denied. Admin privileges required.');
        }
        
        // Store admin token and data
        TokenManager.setToken(response.token);
        UserManager.setUser(response.user);
        localStorage.setItem('admin_data', JSON.stringify(response.user));
        
        Notification.success('Admin login successful!');
        
        // Redirect to admin dashboard
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 1000);
        
    } catch (error) {
        Notification.error(error.message || 'Admin login failed');
    } finally {
        Loading.hide();
    }
}

function checkAdminAuth() {
    const { TokenManager, UserManager } = window.EarnLangUtils;
    
    if (!TokenManager.isAuthenticated()) {
        return false;
    }
    
    const user = UserManager.getUser();
    if (!user || !user.isAdmin) {
        return false;
    }
    
    return true;
}

function initAdminDashboard() {
    const { UserManager } = window.EarnLangUtils;
    
    // Load admin data
    const admin = UserManager.getUser();
    if (admin) {
        updateAdminInfo(admin);
    }
    
    // Load dashboard data
    loadDashboardData();
    
    // Initialize event listeners
    initDashboardEventListeners();
    
    // Auto-refresh every 60 seconds
    setInterval(loadDashboardData, 60000);
}

function updateAdminInfo(admin) {
    const adminNameEl = document.getElementById('adminName');
    const lastLoginEl = document.getElementById('lastLogin');
    
    if (adminNameEl) {
        adminNameEl.textContent = admin.username;
    }
    
    if (lastLoginEl) {
        lastLoginEl.textContent = Format.formatRelativeTime(admin.lastLogin);
    }
}

async function loadDashboardData() {
    const { API, Loading, Notification } = window.EarnLangUtils;
    
    try {
        Loading.show('Loading dashboard data...');
        
        // Load admin dashboard stats
        const stats = await API.get('/admin/dashboard-stats');
        dashboardStats = stats;
        
        // Update UI
        updateStatsDisplay();
        updateActivityDisplay();
        updateSystemStatus();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        Notification.error('Failed to load dashboard data');
    } finally {
        Loading.hide();
    }
}

function updateStatsDisplay() {
    const totalUsersEl = document.getElementById('totalUsers');
    const totalTasksEl = document.getElementById('totalTasks');
    const pendingPayoutsEl = document.getElementById('pendingPayouts');
    const totalPointsEl = document.getElementById('totalPoints');
    
    if (totalUsersEl) {
        totalUsersEl.textContent = Format.formatNumber(dashboardStats.totalUsers || 0);
    }
    
    if (totalTasksEl) {
        totalTasksEl.textContent = Format.formatNumber(dashboardStats.activeTasks || 0);
    }
    
    if (pendingPayoutsEl) {
        pendingPayoutsEl.textContent = Format.formatNumber(dashboardStats.pendingPayouts || 0);
    }
    
    if (totalPointsEl) {
        totalPointsEl.textContent = Format.formatNumber(dashboardStats.totalPoints || 0);
    }
}

async function updateActivityDisplay() {
    const { API } = window.EarnLangUtils;
    
    try {
        const activity = await API.get('/admin/recent-activity');
        displayActivity(activity);
    } catch (error) {
        console.error('Error loading activity:', error);
    }
}

function displayActivity(activity) {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    activityList.innerHTML = '';
    
    if (!activity || activity.length === 0) {
        activityList.innerHTML = '<p class="no-activity">No recent activity</p>';
        return;
    }
    
    activity.forEach(item => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        const icon = getActivityIcon(item.type);
        const color = getActivityColor(item.type);
        
        activityItem.innerHTML = `
            <div class="activity-icon" style="background: ${color}">
                <i class="${icon}"></i>
            </div>
            <div class="activity-content">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
            <div class="activity-time">
                ${Format.formatRelativeTime(item.timestamp)}
            </div>
        `;
        
        activityList.appendChild(activityItem);
    });
}

function getActivityIcon(type) {
    switch (type) {
        case 'user_register': return 'fas fa-user-plus';
        case 'task_complete': return 'fas fa-check-circle';
        case 'payout_request': return 'fas fa-money-bill-wave';
        case 'payout_approved': return 'fas fa-check-double';
        case 'payout_rejected': return 'fas fa-times-circle';
        case 'task_created': return 'fas fa-plus-circle';
        case 'task_updated': return 'fas fa-edit';
        default: return 'fas fa-info-circle';
    }
}

function getActivityColor(type) {
    switch (type) {
        case 'user_register': return '#28a745';
        case 'task_complete': return '#17a2b8';
        case 'payout_request': return '#ffc107';
        case 'payout_approved': return '#28a745';
        case 'payout_rejected': return '#dc3545';
        case 'task_created': return '#6f42c1';
        case 'task_updated': return '#fd7e14';
        default: return '#6c757d';
    }
}

function updateSystemStatus() {
    const lastBackupEl = document.getElementById('lastBackup');
    
    if (lastBackupEl) {
        // Simulate last backup time (in real app, this would come from API)
        const lastBackup = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
        lastBackupEl.textContent = Format.formatDate(lastBackup);
    }
}

function initDashboardEventListeners() {
    const { Notification } = window.EarnLangUtils;
    
    // Refresh activity button
    const refreshBtn = document.getElementById('refreshActivity');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            updateActivityDisplay();
            Notification.success('Activity refreshed');
        });
    }
    
    // Admin logout button
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleAdminLogout);
    }
    
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            link.classList.add('active');
        });
    });
}

function handleAdminLogout() {
    const { AuthGuard, Notification } = window.EarnLangUtils;
    
    if (confirm('Are you sure you want to logout from admin panel?')) {
        // Clear admin data
        localStorage.removeItem('admin_data');
        
        // Logout using AuthGuard
        AuthGuard.logout();
        
        Notification.success('Admin logout successful');
    }
}

// Admin utility functions
const AdminUtils = {
    // Check if user has admin privileges
    isAdmin() {
        const user = UserManager.getUser();
        return user && user.isAdmin;
    },
    
    // Get admin data
    getAdminData() {
        const adminData = localStorage.getItem('admin_data');
        return adminData ? JSON.parse(adminData) : null;
    },
    
    // Update admin data
    updateAdminData(updates) {
        const adminData = this.getAdminData();
        if (adminData) {
            const updatedData = { ...adminData, ...updates };
            localStorage.setItem('admin_data', JSON.stringify(updatedData));
            return updatedData;
        }
        return null;
    },
    
    // Format numbers with commas
    formatNumber(num) {
        return num.toLocaleString();
    },
    
    // Get status badge HTML
    getStatusBadge(status) {
        const statusClass = this.getStatusClass(status);
        return `<span class="status-badge ${statusClass}">${status}</span>`;
    },
    
    // Get status class
    getStatusClass(status) {
        switch (status) {
            case 'active':
            case 'completed':
            case 'approved':
                return 'success';
            case 'pending':
                return 'warning';
            case 'banned':
            case 'rejected':
                return 'error';
            default:
                return 'default';
        }
    },
    
    // Confirm action
    confirmAction(message) {
        return confirm(message);
    },
    
    // Show loading state
    showLoading(element, text = 'Loading...') {
        if (element) {
            element.disabled = true;
            element.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
        }
    },
    
    // Hide loading state
    hideLoading(element, originalText) {
        if (element) {
            element.disabled = false;
            element.innerHTML = originalText;
        }
    }
};

// Export admin utilities
window.AdminUtils = AdminUtils;

// Auto-check admin session
setInterval(() => {
    if (!checkAdminAuth()) {
        window.location.href = 'admin-login.html';
    }
}, 300000); // Check every 5 minutes 