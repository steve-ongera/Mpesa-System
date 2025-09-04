/**
 * Profile Components Module
 * Handles all profile-related UI components and functionality
 */

class ProfileManager {
    constructor(data) {
        this.data = data;
        this.currentTab = 'profile';
        this.init();
    }

    init() {
        this.setupTabs();
        this.renderTabContent();
        this.renderSidebarComponents();
        this.bindEvents();
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update current tab
        this.currentTab = tabName;
        this.renderTabContent();
    }

    renderTabContent() {
        const container = document.getElementById('tabContent');
        
        switch(this.currentTab) {
            case 'profile':
                container.innerHTML = this.getProfileTabHTML();
                this.bindProfileForm();
                break;
            case 'security':
                container.innerHTML = this.getSecurityTabHTML();
                this.bindSecurityForms();
                break;
            case 'accounts':
                container.innerHTML = this.getAccountsTabHTML();
                this.bindAccountActions();
                break;
        }
    }

    getProfileTabHTML() {
        return `
            <div class="tab-content active">
                <form id="profileForm" class="profile-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="firstName">First Name</label>
                            <input type="text" id="firstName" name="first_name" 
                                   class="form-control" value="${this.data.user.firstName}" 
                                   placeholder="Enter first name" required>
                        </div>
                        <div class="form-group">
                            <label for="lastName">Last Name</label>
                            <input type="text" id="lastName" name="last_name" 
                                   class="form-control" value="${this.data.user.lastName}" 
                                   placeholder="Enter last name" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email Address</label>
                            <input type="email" id="email" name="email" 
                                   class="form-control" value="${this.data.user.email}" 
                                   placeholder="Enter email address" required>
                        </div>
                        <div class="form-group">
                            <label for="phoneNumber">Phone Number</label>
                            <input type="text" id="phoneNumber" name="phone_number" 
                                   class="form-control" value="${this.data.user.phoneNumber}" 
                                   placeholder="+254XXXXXXXXX">
                        </div>
                        <div class="form-group">
                            <label for="idNumber">National ID Number</label>
                            <input type="text" id="idNumber" name="id_number" 
                                   class="form-control" value="${this.data.user.idNumber}" 
                                   placeholder="Enter ID number">
                        </div>
                        <div class="form-group">
                            <label for="dateOfBirth">Date of Birth</label>
                            <input type="date" id="dateOfBirth" name="date_of_birth" 
                                   class="form-control" value="${this.data.user.dateOfBirth}">
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">Update Profile</button>
                        <button type="button" class="btn-secondary" id="resetForm">Reset Changes</button>
                    </div>
                </form>
            </div>
        `;
    }

    getSecurityTabHTML() {
        return `
            <div class="tab-content active">
                <div class="security-section">
                    <h6>Change Password</h6>
                    <form id="passwordForm" class="security-form">
                        <div class="form-group">
                            <label for="oldPassword">Current Password</label>
                            <input type="password" id="oldPassword" name="old_password" 
                                   class="form-control" placeholder="Enter current password" required>
                        </div>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="newPassword1">New Password</label>
                                <input type="password" id="newPassword1" name="new_password1" 
                                       class="form-control" placeholder="Enter new password" required>
                            </div>
                            <div class="form-group">
                                <label for="newPassword2">Confirm New Password</label>
                                <input type="password" id="newPassword2" name="new_password2" 
                                       class="form-control" placeholder="Confirm new password" required>
                            </div>
                        </div>
                        <button type="submit" class="btn-primary">Change Password</button>
                    </form>
                </div>

                ${this.data.accounts.mpesa ? `
                    <div class="security-section mt-4">
                        <h6>M-Pesa PIN Management</h6>
                        <form id="pinForm" class="security-form">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="currentPin">Current PIN</label>
                                    <input type="password" id="currentPin" name="current_pin" 
                                           class="form-control" placeholder="Enter current PIN" 
                                           maxlength="4" pattern="[0-9]{4}" required>
                                </div>
                                <div class="form-group">
                                    <label for="newPin">New PIN</label>
                                    <input type="password" id="newPin" name="new_pin" 
                                           class="form-control" placeholder="Enter new PIN" 
                                           maxlength="4" pattern="[0-9]{4}" required>
                                </div>
                            </div>
                            <button type="submit" class="btn-primary">Change PIN</button>
                        </form>
                    </div>
                ` : ''}
            </div>
        `;
    }

    getAccountsTabHTML() {
        const accountsHTML = this.generateAccountsTable();
        const newAccountOptions = this.generateNewAccountOptions();
        
        return `
            <div class="tab-content active">
                <div class="accounts-section">
                    <table class="accounts-table">
                        <thead>
                            <tr>
                                <th>Account Type</th>
                                <th>Account Number</th>
                                <th>Balance</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${accountsHTML}
                        </tbody>
                    </table>
                </div>

                ${newAccountOptions ? `
                    <div class="new-accounts-section mt-4">
                        <h6>Open New Account</h6>
                        ${newAccountOptions}
                    </div>
                ` : ''}
            </div>
        `;
    }

    generateAccountsTable() {
        let html = '';
        
        if (this.data.accounts.mpesa) {
            html += `
                <tr>
                    <td>
                        <div class="account-type">M-Pesa Account</div>
                        <div class="account-meta">Mobile Money</div>
                    </td>
                    <td>
                        <div>${this.data.accounts.mpesa.accountNumber}</div>
                        <div class="account-meta">Created: ${this.data.accounts.mpesa.createdAt}</div>
                    </td>
                    <td>Ksh ${this.data.accounts.mpesa.balance}</td>
                    <td>
                        <span class="${this.data.accounts.mpesa.isActive ? 'status-active' : 'status-inactive'}">
                            ${this.data.accounts.mpesa.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                </tr>
            `;
        }

        if (this.data.accounts.savings) {
            html += `
                <tr>
                    <td>
                        <div class="account-type">Savings Account</div>
                        <div class="account-meta">Personal Savings</div>
                    </td>
                    <td>
                        <div>${this.data.accounts.savings.accountNumber}</div>
                        <div class="account-meta">Created: ${this.data.accounts.savings.createdAt}</div>
                    </td>
                    <td>Ksh ${this.data.accounts.savings.balance}</td>
                    <td><span class="status-active">Active</span></td>
                </tr>
            `;
        }

        if (!this.data.accounts.mpesa && !this.data.accounts.savings) {
            html = '<tr><td colspan="4" class="text-center">No accounts found</td></tr>';
        }

        return html;
    }

    generateNewAccountOptions() {
        if (this.data.accounts.savings) {
            return null; // User already has savings account
        }

        return `
            <div class="account-option">
                <button type="button" class="btn-primary" id="openSavingsBtn">
                    Open Savings Account
                </button>
                <p class="mt-2">Start saving with us today</p>
            </div>
        `;
    }

    renderSidebarComponents() {
        this.renderCompletionChecklist();
        this.renderActivityList();
    }

    renderCompletionChecklist() {
        const completionList = document.getElementById('completionList');
        if (!completionList) return;

        const checks = [
            { label: 'Complete your name', completed: this.data.user.firstName && this.data.user.lastName },
            { label: 'Add email address', completed: this.data.user.email },
            { label: 'Add phone number', completed: this.data.user.phoneNumber },
            { label: 'Add ID number', completed: this.data.user.idNumber },
            { label: 'Verify account', completed: this.data.user.isVerified }
        ];

        completionList.innerHTML = checks.map(check => `
            <li class="${check.completed ? 'completed' : ''}">${check.label}</li>
        `).join('');
    }

    renderActivityList() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        if (!this.data.recentTransactions.length) {
            activityList.innerHTML = '<p class="text-center">No recent activity</p>';
            return;
        }

        activityList.innerHTML = this.data.recentTransactions.map(transaction => `
            <div class="activity-item">
                <div class="activity-info">
                    <h6>${transaction.type}</h6>
                    <p>${transaction.timestamp}</p>
                </div>
                <div class="activity-amount">
                    <p class="amount ${transaction.isOutgoing ? 'negative' : 'positive'}">
                        ${transaction.isOutgoing ? '-' : '+'}Ksh ${transaction.amount}
                    </p>
                    <p class="status">${transaction.status}</p>
                </div>
            </div>
        `).join('');
    }

    bindEvents() {
        // Global form submission handler
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.matches('#profileForm, #passwordForm, #pinForm, #savingsForm')) {
                e.preventDefault();
                this.handleFormSubmission(form);
            }
        });
    }

    bindProfileForm() {
        const resetBtn = document.getElementById('resetForm');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetProfileForm());
        }

        // Phone number validation
        const phoneInput = document.getElementById('phoneNumber');
        if (phoneInput) {
            phoneInput.addEventListener('input', this.validatePhoneNumber);
        }

        // ID number validation
        const idInput = document.getElementById('idNumber');
        if (idInput) {
            idInput.addEventListener('input', this.validateIdNumber);
        }
    }

    bindSecurityForms() {
        // Password confirmation validation
        const newPassword2 = document.getElementById('newPassword2');
        if (newPassword2) {
            newPassword2.addEventListener('input', this.validatePasswordConfirmation);
        }

        // PIN input restrictions
        const pinInputs = document.querySelectorAll('#currentPin, #newPin');
        pinInputs.forEach(input => {
            input.addEventListener('input', this.restrictToNumbers);
        });
    }

    bindAccountActions() {
        const openSavingsBtn = document.getElementById('openSavingsBtn');
        if (openSavingsBtn) {
            openSavingsBtn.addEventListener('click', () => this.showSavingsModal());
        }
    }

    validatePhoneNumber(e) {
        const value = e.target.value;
        const isValid = /^\+?254\d{9}$/.test(value) || value === '';
        
        e.target.classList.toggle('error', value && !isValid);
        
        if (value && !isValid) {
            e.target.setCustomValidity('Phone number must be in format +254XXXXXXXXX');
        } else {
            e.target.setCustomValidity('');
        }
    }

    validateIdNumber(e) {
        const value = e.target.value;
        const isValid = /^\d{7,8}$/.test(value) || value === '';
        
        e.target.classList.toggle('error', value && !isValid);
        
        if (value && !isValid) {
            e.target.setCustomValidity('ID number must be 7 or 8 digits');
        } else {
            e.target.setCustomValidity('');
        }
    }

    validatePasswordConfirmation(e) {
        const newPassword1 = document.getElementById('newPassword1');
        const newPassword2 = e.target;
        
        if (newPassword1 && newPassword2.value !== newPassword1.value) {
            newPassword2.setCustomValidity('Passwords do not match');
            newPassword2.classList.add('error');
        } else {
            newPassword2.setCustomValidity('');
            newPassword2.classList.remove('error');
        }
    }

    restrictToNumbers(e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
    }

    resetProfileForm() {
        const form = document.getElementById('profileForm');
        if (form) {
            // Reset to original values
            form.firstName.value = this.data.user.firstName;
            form.lastName.value = this.data.user.lastName;
            form.email.value = this.data.user.email;
            form.phone_number.value = this.data.user.phoneNumber;
            form.id_number.value = this.data.user.idNumber;
            form.date_of_birth.value = this.data.user.dateOfBirth;
        }
    }

    async handleFormSubmission(form) {
        const formData = new FormData(form);
        formData.append('csrfmiddlewaretoken', this.data.csrfToken);
        
        let url;
        switch(form.id) {
            case 'profileForm':
                url = this.data.urls.updateProfile;
                break;
            case 'passwordForm':
                url = this.data.urls.changePassword;
                break;
            case 'pinForm':
                url = this.data.urls.changeMpesaPin;
                break;
            case 'savingsForm':
                url = this.data.urls.openSavingsAccount;
                break;
            default:
                return;
        }

        try {
            this.setFormLoading(form, true);
            
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                this.showAlert('success', 'Changes saved successfully!');
                
                // Update local data if profile form
                if (form.id === 'profileForm') {
                    this.updateUserData(formData);
                }
                
                // Clear form if password/pin form
                if (form.id === 'passwordForm' || form.id === 'pinForm') {
                    form.reset();
                }
                
                // Reload page if savings form
                if (form.id === 'savingsForm') {
                    setTimeout(() => location.reload(), 1500);
                }
                
            } else {
                const data = await response.json();
                this.showAlert('error', data.message || 'An error occurred. Please try again.');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showAlert('error', 'An error occurred. Please check your connection and try again.');
        } finally {
            this.setFormLoading(form, false);
        }
    }

    updateUserData(formData) {
        this.data.user.firstName = formData.get('first_name');
        this.data.user.lastName = formData.get('last_name');
        this.data.user.email = formData.get('email');
        this.data.user.phoneNumber = formData.get('phone_number');
        this.data.user.idNumber = formData.get('id_number');
        this.data.user.dateOfBirth = formData.get('date_of_birth');
        
        // Update completion percentage and sidebar
        this.data.user.completionPercentage = this.calculateCompletionPercentage();
        this.updateProgressBar();
        this.renderCompletionChecklist();
    }

    calculateCompletionPercentage() {
        const fields = [
            this.data.user.firstName && this.data.user.lastName,
            this.data.user.email,
            this.data.user.phoneNumber,
            this.data.user.idNumber,
            this.data.user.isVerified
        ];
        
        const completed = fields.filter(Boolean).length;
        return Math.round((completed / fields.length) * 100);
    }

    updateProgressBar() {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            const percentage = this.data.user.completionPercentage;
            progressFill.style.width = `${percentage}%`;
            progressFill.textContent = `${percentage}%`;
        }
    }

    showSavingsModal() {
        const modal = new Modal('Open Savings Account', this.getSavingsFormHTML());
        modal.show();
    }

    getSavingsFormHTML() {
        return `
            <form id="savingsForm">
                <div class="form-group">
                    <label for="nextOfKinName">Next of Kin Name</label>
                    <input type="text" id="nextOfKinName" name="next_of_kin_name" 
                           class="form-control" placeholder="Enter next of kin name" required>
                </div>
                <div class="form-group">
                    <label for="nextOfKinPhone">Next of Kin Phone</label>
                    <input type="text" id="nextOfKinPhone" name="next_of_kin_phone" 
                           class="form-control" placeholder="+254XXXXXXXXX" required>
                </div>
                <div class="form-group">
                    <label for="nextOfKinRelationship">Relationship</label>
                    <select id="nextOfKinRelationship" name="next_of_kin_relationship" 
                            class="form-control" required>
                        <option value="">Select relationship</option>
                        <option value="Parent">Parent</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Child">Child</option>
                        <option value="Friend">Friend</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Open Savings Account</button>
                </div>
            </form>
        `;
    }

    setFormLoading(form, isLoading) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = isLoading;
            submitBtn.textContent = isLoading ? 'Processing...' : submitBtn.dataset.originalText || submitBtn.textContent;
            if (!submitBtn.dataset.originalText) {
                submitBtn.dataset.originalText = submitBtn.textContent;
            }
        }
        
        form.classList.toggle('loading', isLoading);
    }

    showAlert(type, message) {
        const alertContainer = document.createElement('div');
        alertContainer.className = `alert alert-${type}`;
        alertContainer.textContent = message;
        
        const tabContent = document.getElementById('tabContent');
        tabContent.insertBefore(alertContainer, tabContent.firstChild);
        
        setTimeout(() => alertContainer.remove(), 5000);
    }
}

// Modal Component
class Modal {
    constructor(title, content) {
        this.title = title;
        this.content = content;
        this.element = null;
    }

    show() {
        this.createElement();
        document.body.appendChild(this.element);
        
        // Trigger animation
        requestAnimationFrame(() => {
            this.element.classList.add('active');
        });
        
        this.bindEvents();
    }

    hide() {
        this.element.classList.remove('active');
        setTimeout(() => {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        }, 300);
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'modal-overlay';
        this.element.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h6>${this.title}</h6>
                    <button type="button" class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.content}
                </div>
            </div>
        `;
    }

    bindEvents() {
        const closeBtn = this.element.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) {
                this.hide();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hide();
            }
        });
    }
}