document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        router.navigate('/mainpage/mainpage.html', '/usermanagment/login.html');
        return;
    }

    // Get user data from localStorage if available
    const userData = localStorage.getItem('userData');
    if (userData) {
        const userDataObj = JSON.parse(userData);
        updateUserProfile(userDataObj);
    }
});

function updateUserProfile(userData) {
    const playerName = document.querySelector('.player-name');
    const avatar = document.querySelector('.avatar');

    if (userData.name) {
        playerName.textContent = userData.name;
    }
    
    if (userData.avatar) {
        avatar.src = userData.avatar;
    }
} 