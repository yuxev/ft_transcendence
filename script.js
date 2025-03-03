loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const csrfToken = getCSRFToken();  // Assume you have a function to get CSRF token

    try {
        const response = await fetch('http://127.0.0.1:8000/api/login/', {  // Updated port here
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,  // Pass CSRF token here if required
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            errorMessage.style.display = 'block';
            errorMessage.textContent = errorData.detail || 'Login failed, please try again.';
            return;
        }

        const data = await response.json();
        if (data.jwt) {
            // On success, redirect to another page or show success message
            window.location.href = '/dashboard';  // Redirect to a dashboard page
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'An error occurred. Please try again.';
    }
});
