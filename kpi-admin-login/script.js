document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = document.getElementById('sunIconWrapper');
    const moonIcon = document.getElementById('moonIconWrapper');
    const html = document.documentElement;

    // Check saved theme or pref
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    const setTheme = (theme) => {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        if (theme === 'dark') {
            moonIcon.classList.add('active');
            sunIcon.classList.remove('active');
        } else {
            sunIcon.classList.add('active');
            moonIcon.classList.remove('active');
        }
    };

    // Initial theme setup
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (prefersDark) {
        setTheme('dark');
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    // Password visibility toggle
    const toggleButtons = document.querySelectorAll('.toggle-password, #togglePassword');

    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const wrapper = btn.closest('.input-wrapper');
            const input = wrapper.querySelector('input');
            const isPassword = input.type === 'password';

            input.type = isPassword ? 'text' : 'password';

            if (isPassword) {
                btn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                `;
            } else {
                btn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                `;
            }
        });
    });

    // Form Validation Logic
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function setInputStatus(input, status, message) {
        const wrapper = input.closest('.input-wrapper');
        const group = input.closest('.input-group');

        // Remove existing status
        input.classList.remove('input-success', 'input-error');
        const existingStatus = group.querySelector('.status-text');
        if (existingStatus) {
            existingStatus.remove();
        }

        let labelSpan = group.querySelector('label span');

        if (status === 'success') {
            input.classList.add('input-success');
            if (labelSpan) {
                labelSpan.style.color = 'var(--accent-success)';
            }
            if (message) {
                const statusDiv = document.createElement('div');
                statusDiv.className = 'status-text success';
                statusDiv.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    ${message}
                `;
                group.appendChild(statusDiv);
            }
        } else if (status === 'error') {
            input.classList.add('input-error');
            if (labelSpan) {
                labelSpan.style.color = 'var(--destructive)';
            }
            if (message) {
                const statusDiv = document.createElement('div');
                statusDiv.className = 'status-text error';
                statusDiv.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    ${message}
                `;
                group.appendChild(statusDiv);
            }
        } else {
            if (labelSpan) {
                labelSpan.style.color = 'var(--destructive)'; // Reset default * color
            }
        }
    }

    // Apply to index.html (email and password)
    const loginEmail = document.getElementById('email');
    const loginPassword = document.getElementById('password');
    if (loginEmail && loginPassword) {
        const validateLogin = () => {
            const emailVal = loginEmail.value.trim();
            const passVal = loginPassword.value.trim();

            if (emailVal !== '') {
                if (validateEmail(emailVal)) {
                    setInputStatus(loginEmail, 'success');
                } else {
                    setInputStatus(loginEmail, 'error', 'Недійсний email');
                }
            } else {
                setInputStatus(loginEmail, 'default');
            }

            if (passVal !== '') {
                if (passVal.length >= 6) {
                    setInputStatus(loginPassword, 'success');
                } else {
                    setInputStatus(loginPassword, 'error', 'Пароль надто короткий (мін. 6 символів)');
                }
            } else {
                setInputStatus(loginPassword, 'default');
            }
        };

        loginEmail.addEventListener('input', validateLogin);
        loginEmail.addEventListener('blur', validateLogin);
        loginPassword.addEventListener('input', validateLogin);
        loginPassword.addEventListener('blur', validateLogin);

        // Custom generic form submit prevention for index.html if inputs are invalid
        const loginBtn = document.querySelector('.login-container .btn-primary');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                validateLogin();
                if (document.querySelectorAll('.input-error').length > 0 || loginEmail.value.trim() === '' || loginPassword.value.trim() === '') {
                    e.preventDefault();
                    if (loginEmail.value.trim() === '') setInputStatus(loginEmail, 'error', 'Обов\'язкове поле');
                    if (loginPassword.value.trim() === '') setInputStatus(loginPassword, 'error', 'Обов\'язкове поле');
                }
            });
        }
    }

    // Apply to forgot-password.html
    const forgotEmail = document.querySelector('input[type="email"]');
    if (forgotEmail && !loginPassword) {
        const validateForgot = () => {
            const emailVal = forgotEmail.value.trim();
            if (emailVal !== '') {
                if (validateEmail(emailVal)) {
                    setInputStatus(forgotEmail, 'success', 'Чудово! Все добре.');
                } else {
                    setInputStatus(forgotEmail, 'error', 'Недійсний email');
                }
            } else {
                setInputStatus(forgotEmail, 'default');
            }
        };
        forgotEmail.addEventListener('input', validateForgot);
        forgotEmail.addEventListener('blur', validateForgot);

        const sendBtn = document.getElementById('send-email-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                validateForgot();
                if (document.querySelectorAll('.input-error').length > 0 || forgotEmail.value.trim() === '') {
                    if (forgotEmail.value.trim() === '') setInputStatus(forgotEmail, 'error', 'Обов\'язкове поле');
                } else {
                    window.location.href = 'check-email.html';
                }
            });
        }
    }

    // Apply to new-password.html
    const newPassword = document.getElementById('new-password');
    const confirmPassword = document.getElementById('confirm-password');

    if (newPassword && confirmPassword) {
        const validateNewPasswords = () => {
            const newPassVal = newPassword.value;
            const confPassVal = confirmPassword.value;

            let isNewPassValid = false;
            if (newPassVal !== '') {
                if (newPassVal.length >= 6) {
                    setInputStatus(newPassword, 'success');
                    isNewPassValid = true;
                } else {
                    setInputStatus(newPassword, 'error', 'Мінімум 6 символів');
                }
            } else {
                setInputStatus(newPassword, 'default');
            }

            if (confPassVal !== '') {
                if (confPassVal === newPassVal && isNewPassValid) {
                    setInputStatus(confirmPassword, 'success', 'Чудово! Все добре.');
                } else {
                    setInputStatus(confirmPassword, 'error', 'Паролі не співпадають');
                }
            } else {
                setInputStatus(confirmPassword, 'default');
            }
        };

        newPassword.addEventListener('input', validateNewPasswords);
        confirmPassword.addEventListener('input', validateNewPasswords);

        const saveBtn = document.getElementById('save-password-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                validateNewPasswords();
                if (document.querySelectorAll('.input-error').length > 0 || newPassword.value === '' || confirmPassword.value === '') {
                    if (newPassword.value === '') setInputStatus(newPassword, 'error', 'Обов\'язкове поле');
                    if (confirmPassword.value === '') setInputStatus(confirmPassword, 'error', 'Обов\'язкове поле');
                } else {
                    window.location.href = 'index.html';
                }
            });
        }
    }
});
