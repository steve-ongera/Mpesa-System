/**
 * Profile Application Entry Point
 * Initializes the profile management system
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get profile data from the JSON script tag
    const profileDataElement = document.getElementById('profileData');
    
    if (!profileDataElement) {
        console.error('Profile data not found');
        return;
    }

    try {
        const profileData = JSON.parse(profileDataElement.textContent);
        
        // Initialize the profile manager
        const profileManager = new ProfileManager(profileData);
        
        // Set up real-time balance updates
        setupBalanceUpdates(profileData);
        
        // Handle Django messages display
        displayDjangoMessages();
        
        console.log('Profile system initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize profile system:', error);
        showErrorMessage('Failed to load profile data. Please refresh the page.');
    }
});

/**
 * Set up periodic balance updates
 */
function setupBalanceUpdates(data) {
    if (!data.urls.accountSummary) return;
    
    const updateBalances = async () => {
        try {
            const response = await fetch(data.urls.accountSummary, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (response.ok) {
                const balanceData = await response.json();
                updateBalanceDisplay(balanceData);
            }
        } catch (error) {
            console.error('Failed to update balances:', error);
        }
    };
    
    // Update balances every 30 seconds
    setInterval(updateBalances, 30000);
}

/**
 * Update balance display in the UI
 */
function updateBalanceDisplay(balanceData) {
    const totalBalanceElement = document.getElementById('totalBalance');
    if (totalBalanceElement && balanceData.total_balance) {
        totalBalanceElement.textContent = balanceData.total_balance;
    }
    
    // Update individual account balances if they exist
    const mpesaBalanceElement = document.querySelector('[data-balance="mpesa"]');
    if (mpesaBalanceElement && balanceData.mpesa_balance) {
        mpesaBalanceElement.textContent = `Ksh ${balanceData.mpesa_balance}`;
    }
    
    const savingsBalanceElement = document.querySelector('[data-balance="savings"]');
    if (savingsBalanceElement && balanceData.savings_balance) {
        savingsBalanceElement.textContent = `Ksh ${balanceData.savings_balance}`;
    }
}

/**
 * Display Django messages (success, error, warning)
 */
function displayDjangoMessages() {
    // Check if there are any Django messages in the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const messageType = urlParams.get('msg_type');
    const messageText = urlParams.get('msg');
    
    if (messageType && messageText) {
        showMessage(messageType, decodeURIComponent(messageText));
        
        // Clean up the URL
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }
    
    // Also check for messages in session storage (if set by Django)
    const sessionMessages = sessionStorage.getItem('django_messages');
    if (sessionMessages) {
        try {
            const messages = JSON.parse(sessionMessages);
            messages.forEach(msg => {
                showMessage(msg.tags, msg.message);
            });
            sessionStorage.removeItem('django_messages');
        } catch (error) {
            console.error('Error parsing session messages:', error);
        }
    }
}

/**
 * Show a message to the user
 */
function showMessage(type, message) {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${type === 'error' ? 'error' : type}`;
    alertContainer.innerHTML = `
        <span>${message}</span>
        <button type="button" class="alert-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add to the top of the main content area
    const mainContent = document.querySelector('.section-content');
    if (mainContent) {
        mainContent.insertBefore(alertContainer, mainContent.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertContainer.parentNode) {
                alertContainer.remove();
            }
        }, 5000);
    }
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    showMessage('error', message);
}

/**
 * Utility function to format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 2
    }).format(amount).replace('KES', 'Ksh');
}

/**
 * Utility function to format dates
 */
function formatDate(dateString, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-KE', formatOptions);
    } catch (error) {
        console.error('Date formatting error:', error);
        return dateString;
    }
}

/**
 * Debounce function for performance optimization
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
}

/**
 * Throttle function for performance optimization
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Form validation utilities
 */
const ValidationUtils = {
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    validatePhone: (phone) => {
        const re = /^\+?254\d{9}$/;
        return re.test(phone);
    },
    
    validateId: (id) => {
        const re = /^\d{7,8}$/;
        return re.test(id);
    },
    
    validatePin: (pin) => {
        const re = /^\d{4}$/;
        return re.test(pin);
    }
};

/**
 * Loading state management
 */
const LoadingManager = {
    show: (element, text = 'Loading...') => {
        if (element) {
            element.classList.add('loading');
            const originalText = element.textContent;
            element.dataset.originalText = originalText;
            element.textContent = text;
        }
    },
    
    hide: (element) => {
        if (element) {
            element.classList.remove('loading');
            const originalText = element.dataset.originalText;
            if (originalText) {
                element.textContent = originalText;
                delete element.dataset.originalText;
            }
        }
    }
};

/**
 * Local storage utilities for caching
 */
const CacheManager = {
    set: (key, data, ttl = 3600000) => { // Default TTL: 1 hour
        const item = {
            data: data,
            timestamp: Date.now(),
            ttl: ttl
        };
        try {
            localStorage.setItem(key, JSON.stringify(item));
        } catch (error) {
            console.warn('Failed to cache data:', error);
        }
    },
    
    get: (key) => {
        try {
            const item = JSON.parse(localStorage.getItem(key));
            if (!item) return null;
            
            if (Date.now() - item.timestamp > item.ttl) {
                localStorage.removeItem(key);
                return null;
            }
            
            return item.data;
        } catch (error) {
            console.warn('Failed to retrieve cached data:', error);
            return null;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('Failed to remove cached data:', error);
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.warn('Failed to clear cache:', error);
        }
    }
};

/**
 * Performance monitoring
 */
const PerformanceMonitor = {
    startTiming: (label) => {
        performance.mark(`${label}-start`);
    },
    
    endTiming: (label) => {
        performance.mark(`${label}-end`);
        performance.measure(label, `${label}-start`, `${label}-end`);
        
        const measure = performance.getEntriesByName(label)[0];
        console.log(`${label} took ${measure.duration.toFixed(2)}ms`);
        
        // Clean up
        performance.clearMarks(`${label}-start`);
        performance.clearMarks(`${label}-end`);
        performance.clearMeasures(label);
    }
};

// Export utilities for use in other modules
window.ProfileUtils = {
    formatCurrency,
    formatDate,
    debounce,
    throttle,
    ValidationUtils,
    LoadingManager,
    CacheManager,
    PerformanceMonitor,
    showMessage,
    showErrorMessage
};