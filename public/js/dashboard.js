// Dashboard functionality for EARNLANG

let currentTasks = [];
let currentCategory = 'all';
let userStats = {};

document.addEventListener('DOMContentLoaded', () => {
    const { AuthGuard, Loading, Notification } = window.EarnLangUtils;
    
    // Check authentication
    if (!AuthGuard.checkAuth()) return;
    
    initDashboard();
});

function initDashboard() {
    const { UserManager, API, Loading, Notification } = window.EarnLangUtils;
    
    // Load user data
    const user = UserManager.getUser();
    if (user) {
        updateUserInfo(user);
    }
    
    // Load dashboard data
    loadDashboardData();
    
    // Initialize event listeners
    initEventListeners();
    
    // Auto-refresh every 30 seconds
    setInterval(loadDashboardData, 30000);
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

async function loadDashboardData() {
    const { API, Loading, Notification } = window.EarnLangUtils;
    
    try {
        Loading.show('Loading dashboard...');
        
        // Load tasks and stats in parallel
        const [tasksResponse, statsResponse] = await Promise.all([
            API.get('/tasks'),
            API.get('/tasks/stats')
        ]);
        
        currentTasks = tasksResponse;
        userStats = statsResponse;
        
        // Update UI
        updateStatsDisplay();
        updateTasksDisplay();
        updateActivityDisplay();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        Notification.error('Failed to load dashboard data');
    } finally {
        Loading.hide();
    }
}

function updateStatsDisplay() {
    const totalTasksEl = document.getElementById('totalTasks');
    const totalEarnedEl = document.getElementById('totalEarned');
    const todayTasksEl = document.getElementById('todayTasks');
    const referralCountEl = document.getElementById('referralCount');
    
    if (totalTasksEl) {
        totalTasksEl.textContent = userStats.totalCompletions || 0;
    }
    
    if (totalEarnedEl) {
        totalEarnedEl.textContent = Format.formatPoints(userStats.totalPointsEarned || 0);
    }
    
    if (todayTasksEl) {
        todayTasksEl.textContent = userStats.todayCompletions || 0;
    }
    
    // Load referral count from user profile
    loadReferralCount();
}

function updateTasksDisplay() {
    const tasksGrid = document.getElementById('tasksGrid');
    const noTasksEl = document.getElementById('noTasks');
    
    if (!tasksGrid) return;
    
    // Filter tasks by category
    const filteredTasks = currentCategory === 'all' 
        ? currentTasks 
        : currentTasks.filter(task => task.type === currentCategory);
    
    if (filteredTasks.length === 0) {
        tasksGrid.classList.add('hidden');
        if (noTasksEl) noTasksEl.classList.remove('hidden');
        return;
    }
    
    if (noTasksEl) noTasksEl.classList.add('hidden');
    tasksGrid.classList.remove('hidden');
    
    // Clear existing tasks
    tasksGrid.innerHTML = '';
    
    // Render tasks
    filteredTasks.forEach(task => {
        const taskCard = createTaskCard(task);
        tasksGrid.appendChild(taskCard);
    });
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.taskId = task._id;
    
    const isCompleted = task.completed || false;
    const isRepeatable = task.isRepeatable || false;
    
    card.innerHTML = `
        <div class="task-header">
            <div>
                <h4 class="task-title">${task.title}</h4>
                <span class="task-type">${task.type}</span>
            </div>
            ${isCompleted && !isRepeatable ? '<span class="completed-badge">✓ Completed</span>' : ''}
        </div>
        <p class="task-description">${task.description}</p>
        <div class="task-footer">
            <div class="task-points">
                <i class="fas fa-star"></i>
                <span>${task.points} points</span>
            </div>
            <button class="complete-btn ${isCompleted && !isRepeatable ? 'disabled' : ''}" 
                    ${isCompleted && !isRepeatable ? 'disabled' : ''}>
                ${isCompleted && !isRepeatable ? 'Completed' : 'Complete Task'}
            </button>
        </div>
    `;
    
    // Add click event for task completion
    const completeBtn = card.querySelector('.complete-btn');
    if (completeBtn && !completeBtn.disabled) {
        completeBtn.addEventListener('click', () => {
            showTaskModal(task);
        });
    }
    
    return card;
}

function showTaskModal(task) {
    const { Modal } = window.EarnLangUtils;
    
    const modal = document.getElementById('taskModal');
    const titleEl = document.getElementById('taskModalTitle');
    const taskTitleEl = document.getElementById('taskTitle');
    const taskDescriptionEl = document.getElementById('taskDescription');
    const taskPointsEl = document.getElementById('taskPoints');
    
    if (titleEl) titleEl.textContent = 'Complete Task';
    if (taskTitleEl) taskTitleEl.textContent = task.title;
    if (taskDescriptionEl) taskDescriptionEl.textContent = task.description;
    if (taskPointsEl) taskPointsEl.textContent = task.points;
    
    // Set up completion button
    const completeBtn = document.getElementById('completeTask');
    const cancelBtn = document.getElementById('cancelTask');
    
    if (completeBtn) {
        completeBtn.onclick = () => completeTask(task._id);
    }
    
    if (cancelBtn) {
        cancelBtn.onclick = () => Modal.hide('taskModal');
    }
    
    Modal.show('taskModal');
}

async function completeTask(taskId) {
    const { API, Notification, Loading, Modal, UserManager } = window.EarnLangUtils;
    
    Loading.show('Completing task...');
    
    try {
        const response = await API.post(`/tasks/complete/${taskId}`);
        
        // Update user points
        const user = UserManager.getUser();
        if (user) {
            UserManager.updateUser({ points: response.newBalance });
            updateUserInfo({ ...user, points: response.newBalance });
        }
        
        Notification.success(`Task completed! +${response.pointsEarned} points`);
        
        // Close modal and refresh data
        Modal.hide('taskModal');
        loadDashboardData();
        
    } catch (error) {
        Notification.error(error.message || 'Failed to complete task');
    } finally {
        Loading.hide();
    }
}

function updateActivityDisplay() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    // Load recent activity
    loadRecentActivity();
}

async function loadRecentActivity() {
    const { API } = window.EarnLangUtils;
    
    try {
        const activity = await API.get('/tasks/history?limit=5');
        displayActivity(activity);
    } catch (error) {
        console.error('Error loading activity:', error);
    }
}

function displayActivity(activity) {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    activityList.innerHTML = '';
    
    if (activity.length === 0) {
        activityList.innerHTML = '<p class="no-activity">No recent activity</p>';
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
                <p>+${item.pointsEarned} points earned</p>
            </div>
            <div class="activity-time">
                ${Format.formatRelativeTime(item.completedAt)}
            </div>
        `;
        
        activityList.appendChild(activityItem);
    });
}

async function loadReferralCount() {
    const { API } = window.EarnLangUtils;
    
    try {
        const referralInfo = await API.get('/user/referral');
        const referralCountEl = document.getElementById('referralCount');
        
        if (referralCountEl) {
            referralCountEl.textContent = referralInfo.referralCount || 0;
        }
    } catch (error) {
        console.error('Error loading referral count:', error);
    }
}

function initEventListeners() {
    const { Notification } = window.EarnLangUtils;
    
    // Category filter buttons
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update category and refresh tasks
            currentCategory = btn.dataset.category;
            updateTasksDisplay();
        });
    });
    
    // Refresh tasks button
    const refreshBtn = document.getElementById('refreshTasks');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadDashboardData();
            Notification.success('Dashboard refreshed');
        });
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

// Auto-complete daily login task
function autoCompleteLoginTask() {
    const loginTask = currentTasks.find(task => task.type === 'login' && task.title.toLowerCase().includes('login'));
    
    if (loginTask && !loginTask.completed) {
        // Auto-complete login task after 1 minute
        setTimeout(() => {
            completeTask(loginTask._id);
        }, 60000);
    }
}

// Initialize auto-completion for login tasks
setTimeout(autoCompleteLoginTask, 5000); 