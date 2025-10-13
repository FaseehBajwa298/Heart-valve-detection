// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// Form switching functionality
function switchToSignup() {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    
    // Add slide animation
    setTimeout(() => {
        signupForm.style.transform = 'translateX(0)';
        signupForm.style.opacity = '1';
    }, 50);
}

function switchToLogin() {
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    
    // Add slide animation
    setTimeout(() => {
        loginForm.style.transform = 'translateX(0)';
        loginForm.style.opacity = '1';
    }, 50);
}

// Password visibility toggle
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = passwordInput.nextElementSibling;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Form validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

function validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Input validation with real-time feedback
function addInputValidation() {
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        input.addEventListener('input', function() {
            clearValidationError(this);
        });
    });
}

function validateInput(input) {
    const value = input.value.trim();
    const inputWrapper = input.parentElement;
    
    // Remove existing error states
    clearValidationError(input);
    
    // Validate based on input type
    switch(input.type) {
        case 'email':
            if (value && !validateEmail(value)) {
                showValidationError(input, 'Please enter a valid email address');
                return false;
            }
            break;
            
        case 'password':
            if (value && !validatePassword(value)) {
                showValidationError(input, 'Password must be at least 8 characters with uppercase, lowercase, and number');
                return false;
            }
            break;
            
        case 'tel':
            if (value && !validatePhone(value)) {
                showValidationError(input, 'Please enter a valid phone number');
                return false;
            }
            break;
            
        default:
            if (input.required && !value) {
                showValidationError(input, 'This field is required');
                return false;
            }
    }
    
    // Special validation for confirm password
    if (input.id === 'confirmPassword') {
        const password = document.getElementById('signupPassword').value;
        if (value && value !== password) {
            showValidationError(input, 'Passwords do not match');
            return false;
        }
    }
    
    return true;
}

function showValidationError(input, message) {
    const inputWrapper = input.parentElement;
    inputWrapper.classList.add('error');
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    // Insert error message after input wrapper
    inputWrapper.parentElement.insertBefore(errorElement, inputWrapper.nextSibling);
    
    // Add error styles
    input.style.borderColor = '#e74c3c';
    input.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
}

function clearValidationError(input) {
    const inputWrapper = input.parentElement;
    const inputGroup = inputWrapper.parentElement;
    const errorMessage = inputGroup.querySelector('.error-message');
    
    inputWrapper.classList.remove('error');
    if (errorMessage) {
        errorMessage.remove();
    }
    
    // Reset input styles
    input.style.borderColor = '#e1e5e9';
    input.style.boxShadow = 'none';
}

// Form submission handling
function handleFormSubmission() {
    const forms = document.querySelectorAll('.auth-form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formInputs = this.querySelectorAll('input[required]');
            let isValid = true;
            
            // Validate all required inputs
            formInputs.forEach(input => {
                if (!validateInput(input)) {
                    isValid = false;
                }
            });
            
            // Check if terms are agreed (for signup)
            const agreeTerms = document.getElementById('agreeTerms');
            if (agreeTerms && !agreeTerms.checked) {
                showNotification('Please agree to the Terms of Service and Privacy Policy', 'error');
                isValid = false;
            }
            
            if (isValid) {
                const submitButton = this.querySelector('.auth-btn.primary');
                const isLogin = this.closest('#loginForm') !== null;
                
                // Show loading state
                submitButton.classList.add('loading');
                submitButton.disabled = true;
                
                // Simulate API call
                setTimeout(() => {
                    submitButton.classList.remove('loading');
                    submitButton.disabled = false;
                    
                    if (isLogin) {
                        showNotification('Login successful! Accessing Heart Valve Detection System...', 'success');
                        // Simulate redirect
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 1500);
                    } else {
                        showNotification('Account created successfully! Welcome to AI Heart Valve Detection System. Please check your email for verification.', 'success');
                        // Switch to login form
                        setTimeout(() => {
                            switchToLogin();
                        }, 2000);
                    }
                }, 2000);
            }
        });
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="closeNotification(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            closeNotification(notification.querySelector('.notification-close'));
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

function closeNotification(button) {
    const notification = button.closest('.notification');
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 300);
}

// Enhanced animations
function addEnhancedAnimations() {
    // Floating shapes animation enhancement
    const shapes = document.querySelectorAll('.floating-shape');
    shapes.forEach((shape, index) => {
        shape.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.2) rotate(45deg)';
            this.style.opacity = '1';
        });
        
        shape.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
            this.style.opacity = '0.7';
        });
    });
    
    // Input focus animations
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
            this.parentElement.style.transition = 'transform 0.3s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
    
    // Button hover effects
    const buttons = document.querySelectorAll('.auth-btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Keyboard navigation
function addKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Switch forms with Tab + Shift
        if (e.key === 'Tab' && e.shiftKey && e.ctrlKey) {
            e.preventDefault();
            const isLoginVisible = !loginForm.classList.contains('hidden');
            if (isLoginVisible) {
                switchToSignup();
            } else {
                switchToLogin();
            }
        }
        
        // Submit form with Ctrl + Enter
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            const activeForm = document.querySelector('.form-wrapper:not(.hidden) .auth-form');
            if (activeForm) {
                activeForm.dispatchEvent(new Event('submit'));
            }
        }
    });
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    addInputValidation();
    handleFormSubmission();
    addEnhancedAnimations();
    addKeyboardNavigation();
    
    // Add welcome animation
    setTimeout(() => {
        document.querySelector('.auth-container').style.transform = 'scale(1)';
        document.querySelector('.auth-container').style.opacity = '1';
    }, 100);
    
    console.log('AI Heart Valve Disorder Detection - Authentication System Initialized');
});

// Add notification styles dynamically
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
        overflow: hidden;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification.success {
        border-left: 4px solid #4ade80;
    }
    
    .notification.error {
        border-left: 4px solid #e74c3c;
    }
    
    .notification.warning {
        border-left: 4px solid #f39c12;
    }
    
    .notification.info {
        border-left: 4px solid #3498db;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        padding: 15px 20px;
        gap: 15px;
    }
    
    .notification-content i:first-child {
        font-size: 1.2rem;
    }
    
    .notification.success .notification-content i:first-child {
        color: #4ade80;
    }
    
    .notification.error .notification-content i:first-child {
        color: #e74c3c;
    }
    
    .notification.warning .notification-content i:first-child {
        color: #f39c12;
    }
    
    .notification.info .notification-content i:first-child {
        color: #3498db;
    }
    
    .notification-content span {
        flex: 1;
        font-size: 0.9rem;
        color: #333;
    }
    
    .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        color: #999;
        font-size: 0.9rem;
        padding: 5px;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .notification-close:hover {
        background: #f5f5f5;
        color: #333;
    }
    
    .error-message {
        color: #e74c3c;
        font-size: 0.8rem;
        margin-top: 5px;
        animation: fadeInUp 0.3s ease;
    }
    
    @media (max-width: 480px) {
        .notification {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
            transform: translateY(-100px);
        }
        
        .notification.show {
            transform: translateY(0);
        }
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Image upload preview for info panel
function wireInfoImageUpload() {
    const input = document.getElementById('infoImageInput');
    const img = document.getElementById('infoImage');
    if (!input || !img) return;

    input.addEventListener('change', function() {
        const file = this.files && this.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            if (typeof showNotification === 'function') {
                showNotification('Please select a valid image file.', 'warning');
            }
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
        };

        if (typeof showNotification === 'function') {
            showNotification('Image loaded successfully.', 'success');
        }
    });
}

// Ensure upload preview wiring runs after DOM ready
document.addEventListener('DOMContentLoaded', wireInfoImageUpload);