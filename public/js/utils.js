// Utility functions for EARNLANG platform

// API Base URL
const API_BASE = window.location.origin + '/api';

// Token management
const TokenManager = {
    getToken() {
        return localStorage.getItem('earnlang_token');
    },
    
    setToken(token) {
        localStorage.setItem('earnlang_token', token);
    },
    
    removeToken() {
        localStorage.removeItem('earnlang_token');
    },
    
    isAuthenticated() {
        return !!this.getToken();
    }
};

// User data management
const UserManager = {
    getUser() {
        const userData = localStorage.getItem('earnlang_user');
        return userData ? JSON.parse(userData) : null;
    },
    
    setUser(user) {
        localStorage.setItem('earnlang_user', JSON.stringify(user));
    },
    
    removeUser() {
        localStorage.removeItem('earnlang_user');
    },
    
    updateUser(updates) {
        const user = this.getUser();
        if (user) {
            const updatedUser = { ...user, ...updates };
            this.setUser(updatedUser);
            return updatedUser;
        }
        return null;
    }
};

// API request helper
const API = {
    async request(endpoint, options = {}) {
        const token = TokenManager.getToken();
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };
        
        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    get(endpoint) {
        return this.request(endpoint);
    },
    
    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
};

// Notification system
const Notification = {
    show(message, type = 'success', duration = 5000) {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, duration);
    },
    
    success(message) {
        this.show(message, 'success');
    },
    
    error(message) {
        this.show(message, 'error');
    },
    
    warning(message) {
        this.show(message, 'warning');
    }
};

// Loading overlay
const Loading = {
    show(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        if (!overlay) return;
        
        const messageEl = overlay.querySelector('p');
        if (messageEl) {
            messageEl.textContent = message;
        }
        
        overlay.classList.remove('hidden');
    },
    
    hide() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }
};

// Modal management
const Modal = {
    show(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    },
    
    hide(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    },
    
    hideAll() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.add('hidden');
        });
        document.body.style.overflow = 'auto';
    }
};

// Authentication check and redirect
const AuthGuard = {
    checkAuth() {
        if (!TokenManager.isAuthenticated()) {
            window.location.href = '/index.html';
            return false;
        }
        return true;
    },
    
    checkGuest() {
        if (TokenManager.isAuthenticated()) {
            window.location.href = '/dashboard.html';
            return false;
        }
        return true;
    },
    
    logout() {
        TokenManager.removeToken();
        UserManager.removeUser();
        window.location.href = '/index.html';
    }
};

// Form validation
const Validation = {
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    isValidPassword(password) {
        return password.length >= 6;
    },
    
    isValidUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(username);
    },
    
    isValidGCashNumber(number) {
        const gcashRegex = /^09\d{9}$/;
        return gcashRegex.test(number);
    }
};

// Format utilities
const Format = {
    formatPoints(points) {
        return points.toLocaleString();
    },
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    },
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    }
};

// Tab management
const TabManager = {
    init(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;
        
        const tabBtns = container.querySelectorAll('.tab-btn');
        const tabPanes = container.querySelectorAll('.tab-pane');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                
                // Remove active class from all buttons and panes
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));
                
                // Add active class to clicked button and corresponding pane
                btn.classList.add('active');
                const targetPane = document.getElementById(`${targetTab}Tab`);
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });
    }
};

// Event listeners for common elements
document.addEventListener('DOMContentLoaded', () => {
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                Modal.hide(modal.id);
            }
        });
    });
    
    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                Modal.hide(modal.id);
            }
        });
    });
    
    // User dropdown toggle
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
});

// Export utilities for use in other modules
window.EarnLangUtils = {
    TokenManager,
    UserManager,
    API,
    Notification,
    Loading,
    Modal,
    AuthGuard,
    Validation,
    Format,
    TabManager
}; 