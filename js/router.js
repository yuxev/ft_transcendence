class Router {
    constructor(routes) {
        this.routes = routes;
        this.currentPath = window.location.pathname;
        this.transitioning = false;
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            this.navigate(window.location.pathname, false);
        });
    }
    
    async navigate(path, addToHistory = true) {
        if (this.currentPath === path || this.transitioning) return;
        
        const route = this.routes[path];
        if (!route) {
            console.error('Route not found:', path);
            return;
        }
        
        this.transitioning = true;
        
        try {
            // Clean up previous route if needed
            if (this.currentPath === '/game' && window.Game) {
                window.Game.cleanup();
            }
            
            if (addToHistory) {
                history.pushState(null, '', path);
            }
            
            this.currentPath = path;
            await route.load();
            
        } catch (error) {
            console.error('Navigation error:', error);
        } finally {
            this.transitioning = false;
        }
    }
}

// Initialize router
const router = new Router({
    '/tournament': {
        load: loadTournamentContent
    },
    '/game': {
        load: loadGameContent
    }
});

// Export router for use in other files
window.router = router; 