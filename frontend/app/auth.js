const container = document.querySelector('.container');
const loginBtn = document.querySelector('.login-btn');
const registerBtn = document.querySelector('.register-btn');
const loginForm = document.querySelector('.form-box.login form');
const registerForm = document.querySelector('.form-box.register form');
const API_URL = 'http://localhost:8000';

console.log(`Testing connection to backend at ${API_URL}`);
fetch(`${API_URL}/api/user/is-oauth`, {
    method: 'GET',
    headers: {},
})
.then(response => {
    console.log(`Backend connection test: ${response.status}`);
})
.catch(error => {
    console.error(`Backend connection failed: ${error.message}`);
});

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

// Fix login form selection and event handling
document.addEventListener('DOMContentLoaded', function() {
    // For direct debugging
    console.log('DOM fully loaded');
    
    // Test backend connection
    console.log(`Testing connection to backend at ${API_URL}`);
    fetch(`${API_URL}/api/test`, {
        method: 'GET'
    })
    .then(response => {
        console.log(`Backend connection test status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        console.log('Backend test response:', data);
    })
    .catch(error => {
        console.error(`Backend connection failed: ${error.message}`);
    });
    
    // Fix login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('Login form found, attaching event listener');
        
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Login form submitted');
            
            // Get credentials
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Clear previous error
            const errorElement = document.getElementById('login-error');
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
            
            console.log(`Attempting login with email: ${email}`);
            
            // Show loading state
            if (errorElement) {
                errorElement.textContent = 'Logging in...';
                errorElement.style.display = 'block';
                errorElement.style.color = '#0066cc';
            }
            
            // Send login request
            fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password
                }),
                credentials: 'include'
            })
            .then(response => {
                console.log(`Login response status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                console.log('Login response:', data);
                if (data.jwt) {
                    // Store JWT token
                    localStorage.setItem('jwt', data.jwt);
                    
                    // Initialize userData object if needed
                    let userData = JSON.parse(localStorage.getItem('userData') || '{}');
                    
                    // Store basic user data if available in the response
                    if (data.name) userData.name = data.name;
                    if (data.email) userData.email = data.email;
                    if (data.image_url) userData.image_url = data.image_url;
                    
                    // Save updated userData
                    localStorage.setItem('userData', JSON.stringify(userData));
                    
                    // Redirect to main page
                    window.location.href = '/mainpage/mainpage.html';
                } else {
                    throw new Error('Login failed - no token received');
                }
            })
            .catch(err => {
                console.error('Login error:', err);
                if (errorElement) {
                    errorElement.textContent = err.message || 'Login failed';
                    errorElement.style.display = 'block';
                    errorElement.style.color = 'red';
                }
            });
        });
    } else {
        console.error('Login form not found!');
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

// Handle OAuth callback directly
if (window.location.search.includes('code=')) {
    const code = new URLSearchParams(window.location.search).get('code');
    console.log('Detected OAuth callback with code:', code);
    
    fetch(`${API_URL}/api/oauth/42/callback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ code })
    })
    .then(response => {
        console.log('OAuth callback response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('OAuth callback data:', data);
        if (data.jwt) {
            localStorage.setItem('jwt', data.jwt);
            // Set a flag that this is a fresh login
            sessionStorage.setItem('freshLogin', 'true');
            window.location.href = '/mainpage/mainpage.html';
        }
    })
    .catch(error => {
        console.error('OAuth callback error:', error);
    });
} 