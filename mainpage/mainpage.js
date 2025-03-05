document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const userData = localStorage.getItem('userData');
    if (!userData) {
        window.location.href = '../usermanagment/loging.html';
        return;
    }

    const settingsModal = document.getElementById('settingsModal');
    const settingsBtn = document.querySelector('.settings');
    const backBtn = document.querySelector('.back-button');
    const profileUpload = document.getElementById('profileUpload');
    const profilePreview = document.getElementById('profilePreview');
    const playerNameInput = document.getElementById('playerNameInput');
    const emailInput = document.getElementById('emailInput');
    const languageSelect = document.getElementById('languageSelect');
    const logoutBtn = document.querySelector('.logout-btn');

    // Get user data from localStorage if available
    const userDataObj = JSON.parse(userData) || {};
    updateUserProfile(userDataObj);

    // Settings button click handler
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('active');
        // Populate form with existing data
        playerNameInput.value = userDataObj.name || '';
        emailInput.value = userDataObj.email || '';
        languageSelect.value = userDataObj.language || 'en';
        if (userDataObj.avatar) {
            profilePreview.src = userDataObj.avatar;
        }
    });

    // Back button click handler
    backBtn.addEventListener('click', () => {
        settingsModal.classList.remove('active');
    });

    // Profile picture upload handler
    profileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const avatar = e.target.result;
                profilePreview.src = avatar;
                userDataObj.avatar = avatar;
                localStorage.setItem('userData', JSON.stringify(userDataObj));
                updateUserProfile(userDataObj);
            };
            reader.readAsDataURL(file);
        }
    });

    // Player name input handler
    playerNameInput.addEventListener('change', (e) => {
        userDataObj.name = e.target.value;
        localStorage.setItem('userData', JSON.stringify(userDataObj));
        updateUserProfile(userDataObj);
    });

    // Language select handler
    languageSelect.addEventListener('change', (e) => {
        userDataObj.language = e.target.value;
        localStorage.setItem('userData', JSON.stringify(userDataObj));
    });

    // Logout handler
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('userData');
        window.location.href = '../index.html';
    });
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