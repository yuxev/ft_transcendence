const container = document.querySelector('.container');
const loginBtn = document.querySelector('.login-btn');
const registerBtn = document.querySelector('.register-btn');
const loginForm = document.querySelector('.form-box.login form');
const registerForm = document.querySelector('.form-box.register form');
const errorMessage = document.getElementById('error-message');
const API_URL = 'http://localhost:8000';

// Toggle between login and register forms
loginBtn.addEventListener('click', () => {
    localStorage.setItem("isLoggedIn", 'true');
    container.classList.remove('active');
});

registerBtn.addEventListener('click', () => {
    localStorage.setItem("isLoggedIn", 'true');
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
                email: email,
                password: password
            })
        });

        if (response.ok) {
            alert('Registration successful! Please login.');
            container.classList.remove('active');
        } else {
            const data = await response.json();
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
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

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
        
        if (response.ok) {
            localStorage.setItem('jwt', data.jwt);
            await getUserData();
            // Use router to navigate to mainpage
            router.navigate('/usermanagment/login.html', '/mainpage/index.html');
        } else {
            alert(data.detail || 'Login failed!');
        }
    } catch (error) {
        console.error('Error:', error);
        // alert('Error during login!');
        router.navigate('/usermanagment/login.html', '/mainpage/index.html');

    }
});

// Get user data
async function getUserData() {
    try {
        const jwt = localStorage.getItem('jwt');
        if (!jwt) {
            showAuth();
            return;
        }

        const response = await fetch(`${API_URL}/api/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('userData').innerHTML = `
                ${data.image_url ? `<img src="${data.image_url}" alt="Profile" class="profile-image">` : ''}
                <h2>${data.name}</h2>
                <p>${data.email}</p>
            `;
        } else {
            localStorage.removeItem('jwt');
            showAuth();
        }
    } catch (error) {
        console.error('Error:', error);
        localStorage.removeItem('jwt');
        showAuth();
    }
}

// Show/Hide containers
function showAuth() {
    document.getElementById('authContainer').classList.remove('hidden');
    document.getElementById('dashboardContainer').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('authContainer').classList.add('hidden');
    document.getElementById('dashboardContainer').classList.remove('hidden');
}

// Check auth status on page load
window.addEventListener('DOMContentLoaded', async () => {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
        try {
            const response = await fetch(`${API_URL}/api/user`, {
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
            });

            if (response.ok) {
                await getUserData();
                showDashboard();
            } else {
                showAuth();
            }
        } catch (error) {
            showAuth();
        }
    } else {
        showAuth();
    }
});

// Logout function
async function logout() {
    try {
        const response = await fetch(`${API_URL}/api/logout`, {
            method: 'POST',
            credentials: 'include',
        });

        if (response.ok) {
            localStorage.removeItem('jwt');
            // Use router to navigate back to login
            router.navigate('/mainpage/index.html', '/usermanagment/login.html');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Update the initiate42Auth function
async function initiate42Auth() {
    try {
        const response = await fetch(`${API_URL}/api/oauth/42`);
        const data = await response.json();
        // Store the current view state
        sessionStorage.setItem('lastView', 'auth');
        // Redirect to 42 auth
        window.location.href = data.auth_url;
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to initiate 42 authentication');
    }
}

// Add event listeners for 42 buttons
document.querySelector('.form-box.login .ft-btn').addEventListener('click', (e) => {
    e.preventDefault();
    initiate42Auth();
});

document.querySelector('.form-box.register .ft-btn').addEventListener('click', (e) => {
    e.preventDefault();
    initiate42Auth();
});

// Add this at the start of your script
// Check for OAuth callback
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
    // Handle OAuth callback
    fetch(`${API_URL}/api/oauth/42/callback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ code })
    })
    .then(response => response.json())
    .then(async data => {
        if (data.jwt) {
            localStorage.setItem('jwt', data.jwt);
            // Clean up URL
            window.history.replaceState({}, document.title, '/');
            await getUserData();
            showDashboard();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAuth();
    });
}