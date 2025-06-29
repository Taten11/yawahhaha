// Authentication functionality for EARNLANG

document.addEventListener('DOMContentLoaded', () => {
    const { API, Notification, Loading, AuthGuard, Validation, Format } = window.EarnLangUtils;
    
    // Check if user is already authenticated
    if (AuthGuard.checkGuest()) {
        initAuth();
    }
});

function initAuth() {
    const { API, Notification, Loading, Validation } = window.EarnLangUtils;
    
    // Tab switching for login/signup
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show corresponding form
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${targetTab}Form`) {
                    form.classList.add('active');
                }
            });
        });
    });
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Email verification page
    if (window.location.pathname.includes('verify.html')) {
        initEmailVerification();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const { API, Notification, Loading, UserManager } = window.EarnLangUtils;
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Validation
    if (!email || !password) {
        Notification.error('Please fill in all fields');
        return;
    }
    
    if (!Validation.isValidEmail(email)) {
        Notification.error('Please enter a valid email address');
        return;
    }
    
    Loading.show('Logging in...');
    
    try {
        const response = await API.post('/auth/login', {
            email,
            password
        });
        
        // Store token and user data
        TokenManager.setToken(response.token);
        UserManager.setUser(response.user);
        
        Notification.success('Login successful!');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1000);
        
    } catch (error) {
        Notification.error(error.message || 'Login failed');
    } finally {
        Loading.hide();
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const { API, Notification, Loading, Validation } = window.EarnLangUtils;
    
    const username = document.getElementById('signupUsername')?.value.trim() || 
                    document.getElementById('username')?.value.trim();
    const email = document.getElementById('signupEmail')?.value.trim() || 
                  document.getElementById('email')?.value.trim();
    const password = document.getElementById('signupPassword')?.value || 
                     document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    const referralCode = document.getElementById('referralCode')?.value.trim();
    const termsAccepted = document.getElementById('termsAccepted')?.checked;
    
    // Validation
    if (!username || !email || !password) {
        Notification.error('Please fill in all required fields');
        return;
    }
    
    if (!Validation.isValidUsername(username)) {
        Notification.error('Username must be 3-20 characters and contain only letters, numbers, and underscores');
        return;
    }
    
    if (!Validation.isValidEmail(email)) {
        Notification.error('Please enter a valid email address');
        return;
    }
    
    if (!Validation.isValidPassword(password)) {
        Notification.error('Password must be at least 6 characters long');
        return;
    }
    
    if (confirmPassword && password !== confirmPassword) {
        Notification.error('Passwords do not match');
        return;
    }
    
    if (termsAccepted === false) {
        Notification.error('Please accept the Terms of Service');
        return;
    }
    
    Loading.show('Creating your account...');
    
    try {
        const signupData = {
            username,
            email,
            password
        };
        
        if (referralCode) {
            signupData.referralCode = referralCode;
        }
        
        const response = await API.post('/auth/register', signupData);
        
        // Store token and user data
        TokenManager.setToken(response.token);
        UserManager.setUser(response.user);
        
        Notification.success('Account created successfully! Please verify your email.');
        
        // Redirect to verification page or dashboard
        setTimeout(() => {
            if (!response.user.isVerified) {
                window.location.href = '/verify.html';
            } else {
                window.location.href = '/dashboard.html';
            }
        }, 1000);
        
    } catch (error) {
        Notification.error(error.message || 'Registration failed');
    } finally {
        Loading.hide();
    }
}

function initEmailVerification() {
    const { API, Notification, Loading, UserManager } = window.EarnLangUtils;
    
    const user = UserManager.getUser();
    if (!user) {
        window.location.href = '/index.html';
        return;
    }
    
    // Display user email
    const userEmailEl = document.getElementById('userEmail');
    if (userEmailEl) {
        userEmailEl.textContent = user.email;
    }
    
    // Resend email button
    const resendBtn = document.getElementById('resendBtn');
    if (resendBtn) {
        resendBtn.addEventListener('click', handleResendEmail);
    }
    
    // Change email button
    const changeEmailBtn = document.getElementById('changeEmailBtn');
    if (changeEmailBtn) {
        changeEmailBtn.addEventListener('click', () => {
            Modal.show('changeEmailModal');
        });
    }
    
    // Change email form
    const changeEmailForm = document.getElementById('changeEmailForm');
    if (changeEmailForm) {
        changeEmailForm.addEventListener('submit', handleChangeEmail);
    }
    
    // Cancel change email
    const cancelChangeEmail = document.getElementById('cancelChangeEmail');
    if (cancelChangeEmail) {
        cancelChangeEmail.addEventListener('click', () => {
            Modal.hide('changeEmailModal');
        });
    }
    
    // Check verification status periodically
    checkVerificationStatus();
}

async function handleResendEmail() {
    const { API, Notification, Loading } = window.EarnLangUtils;
    
    Loading.show('Sending verification email...');
    
    try {
        await API.post('/auth/resend-verification');
        Notification.success('Verification email sent!');
    } catch (error) {
        Notification.error(error.message || 'Failed to send verification email');
    } finally {
        Loading.hide();
    }
}

async function handleChangeEmail(e) {
    e.preventDefault();
    const { API, Notification, Loading, Validation, UserManager } = window.EarnLangUtils;
    
    const newEmail = document.getElementById('newEmail').value.trim();
    const currentPassword = document.getElementById('currentPassword').value;
    
    if (!newEmail || !currentPassword) {
        Notification.error('Please fill in all fields');
        return;
    }
    
    if (!Validation.isValidEmail(newEmail)) {
        Notification.error('Please enter a valid email address');
        return;
    }
    
    Loading.show('Updating email...');
    
    try {
        await API.put('/user/profile', {
            email: newEmail,
            currentPassword
        });
        
        // Update user data
        UserManager.updateUser({ email: newEmail, isVerified: false });
        
        Notification.success('Email updated! Please verify your new email address.');
        Modal.hide('changeEmailModal');
        
        // Update displayed email
        const userEmailEl = document.getElementById('userEmail');
        if (userEmailEl) {
            userEmailEl.textContent = newEmail;
        }
        
    } catch (error) {
        Notification.error(error.message || 'Failed to update email');
    } finally {
        Loading.hide();
    }
}

async function checkVerificationStatus() {
    const { API, UserManager } = window.EarnLangUtils;
    
    try {
        const user = await API.get('/auth/me');
        
        if (user.isVerified) {
            UserManager.updateUser({ isVerified: true });
            Notification.success('Email verified successfully!');
            
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1500);
        }
    } catch (error) {
        console.error('Error checking verification status:', error);
    }
    
    // Check again in 30 seconds
    setTimeout(checkVerificationStatus, 30000);
}

// Handle URL parameters for email verification
function handleVerificationToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
        verifyEmailToken(token);
    }
}

async function verifyEmailToken(token) {
    const { API, Notification, Loading, UserManager } = window.EarnLangUtils;
    
    Loading.show('Verifying email...');
    
    try {
        const response = await API.post('/auth/verify-email', { token });
        
        UserManager.updateUser({ isVerified: true });
        Notification.success('Email verified successfully!');
        
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1500);
        
    } catch (error) {
        Notification.error(error.message || 'Email verification failed');
    } finally {
        Loading.hide();
    }
}

// Initialize verification token handling
if (window.location.search.includes('token=')) {
    handleVerificationToken();
} 