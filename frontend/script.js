const container = document.querySelector('.container');
const loginBtn = document.querySelector('.login-btn');
const registerBtn = document.querySelector('.register-btn');
const loginForm = document.querySelector('.form-box.login form');
const registerForm = document.querySelector('.form-box.register form');
const API_URL = 'http://localhost:8000';

// Toggle between login and register forms
loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

// Register function
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = registerForm.querySelector('input[type="text"]').value;
    const email = registerForm.querySelector('input[type="email"]').value;
    const password = registerForm.querySelector('input[type="password"]').value;

    try {
        const response = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: username,
                email,
                password
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Registration successful! Please login.');
            container.classList.remove('active');
        } else {
            alert(data.message || 'Registration failed!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error during registration!');
    }
});

// Login function
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get the email and password values directly from the form inputs
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    console.log('Attempting login with:', { email, password: '***' });

    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();
        console.log('Login response status:', response.status);
        console.log('Login response data:', data);
        
        if (response.ok) {
            localStorage.setItem('jwt', data.jwt);
            window.location.href = '/mainpage/mainpage.html';
        } else {
            alert(data.detail || data.message || 'Login failed!');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Error during login! Please check the console for details.');
    }
});

// Check auth status on page load
window.addEventListener('DOMContentLoaded', () => {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
        window.location.href = '/mainpage/mainpage.html';
    }
});

// 42 OAuth function
async function initiate42Auth() {
    try {
        const response = await fetch(`${API_URL}/api/oauth/42`);
        const data = await response.json();
        window.location.href = data.auth_url;
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to initiate 42 authentication');
    }
}

// Add event listeners for 42 buttons
const ft42Buttons = document.querySelectorAll('.ft-btn');
ft42Buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        initiate42Auth();
    });
});