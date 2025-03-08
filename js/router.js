class Router {
  constructor() {
    this.routes = {
      "/": {
        template: "./home.html",
        styles: [],
        scripts: [],
      },
      "/login": {
        template: "./usermanagment/login.html",
        styles: ["./usermanagment/login.css"],
        scripts: ["./usermanagment/login.js"],
      },
      "/mainpage": {
        template: "./mainpage/mainpage.html",
        styles: ["./mainpage/mainpage.css"],
        scripts: ["./mainpage/mainpage.js"],
      },
      "/tournament": {
        template: "./tournament/main.html",
        styles: ["./tournament/trnmtStyle.css"],
        scripts: ["./tournament/trnmntLogic.js"],
      },
      "/game": {
        template: "./game/game.html",
        styles: ["./game/game.css"],
        scripts: ["./game/game.js"],
      },
    };

    this.loadedResources = {
      styles: new Map(),
      scripts: new Map(),
    };

    // Handle initial route
    window.addEventListener("load", () => {
      // Get the path from URL or hash
      const path = window.location.hash.slice(1) || "/";
      this.handleRoute(path);
    });

    // Handle browser back/forward and hash changes
    window.addEventListener("hashchange", () => {
      const path = window.location.hash.slice(1) || "/";
      this.handleRoute(path);
    });
  }

  async handleRoute(path) {
    // Clean up path
    path = path.replace(/\/+$/, "") || "/";

    const route = this.routes[path];
    if (!route) {
      console.error("No route found for path:", path);
      this.navigate("/");
      return;
    }

    try {
      this.unloadResources();
      const response = await fetch(route.template);
      if (!response.ok) throw new Error(`Failed to load ${route.template}`);

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      // document.getElementById('content').innerHTML = doc.body.innerHTML;

      await Promise.all(route.styles.map((style) => this.loadCSS(style)));
      route.scripts.forEach((script) => this.loadScript(script));

      const title = doc.querySelector("title");
      if (title) document.title = title.textContent;
    } catch (error) {
      console.error("Error:", error);
      document.getElementById(
        "content"
      ).innerHTML = `<h1>Error Loading Page</h1><p>${error.message}</p>`;
    }
  }

  navigate(path) {
    window.location.hash = path;
  }

  loadCSS(path) {
    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = path;
      link.onload = () => {
        this.loadedResources.styles.set(path, link);
        resolve();
      };
      link.onerror = () => reject(new Error(`Failed to load CSS: ${path}`));
      document.head.appendChild(link);
    });
  }

  loadScript(path) {
    const script = document.createElement("script");
    script.src = path;
    script.onload = () => this.loadedResources.scripts.set(path, script);
    script.onerror = () => console.error(`Failed to load script: ${path}`);
    document.head.appendChild(script);
  }

  unloadResources() {
    this.loadedResources.styles.forEach((link) => link.remove());
    this.loadedResources.scripts.forEach((script) => script.remove());
    this.loadedResources.styles.clear();
    this.loadedResources.scripts.clear();
  }
}

// Initialize router
const router = new Router();

// Export navigate function for use in HTML
window.navigate = (event, path) => {
  event.preventDefault();
  router.navigate(path);
};
