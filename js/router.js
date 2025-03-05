function navigate(event, path) {
  event.preventDefault();
  window.location.hash = path;
  loadContent(path);
}

let loadedResources = {
  styles: new Map(),
  scripts: new Map()
};


function loadCSS(filePath) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = filePath;
    link.onload = () => resolve(link);
    link.onerror = () => reject(new Error(`Failed to load CSS: ${filePath}`));
    document.head.appendChild(link);
  });
}

// function loadScript(filePath) {
//   return new Promise((resolve, reject) => {
//     const script = document.createElement('script');
//     script.src = filePath;
//     script.defer = true;
//     script.onload = () => resolve(script);
//     script.onerror = () => reject(new Error(`Failed to load script: ${filePath}`));
//     document.body.appendChild(script);
//   });
// }

function unloadResources() {
  loadedResources.styles.forEach((link, path) => {
    if (link && link.parentNode) {
      link.parentNode.removeChild(link);
    }
    loadedResources.styles.delete(path);
  });

  loadedResources.scripts.forEach((script, path) => {
    if (script && script.parentNode) {
      script.parentNode.removeChild(script);
    }
    loadedResources.scripts.delete(path);
  });
}

// router.js

const routes = {
  '/': {
    template: 'home.html',
    styles: ['styles/home.css'],
    scripts: ['scripts/home.js']
  },
  '/login': {
    template: '../usermanagment/login.html',
    styles: ['../usermanagment/login.css'],
    scripts: ['../usermanagment/login.js']
  },
  '/mainpage': {
    template: '../mainpage/mainpage.html',
    styles: ['../mainpage/mainpage.css'],
    scripts: ['../mainpage/mainpage.js']
  },
  '/tournament': {
    template: '../tournament/main.html',
    styles: ['../tournament/trnmtStyle.css'],
    scripts: ['../tournament/trnmntLogic.js']
  },
  '/game': {
    template: '../game/game.html',
    styles: ['../game/game.css'],
    scripts: ['../game/game.js']
  }
};


function loadScript(url) {
  const script = document.createElement('script');
  script.src = url;
  script.onload = () => {
      console.log(`${url} loaded successfully.`);
      
  };
  script.onerror = () => {
      console.error(`Failed to load script ${url}`);
  };
  document.head.appendChild(script);
}
// router.js

async function loadContent(path) {
  const route = routes[path];
  if (!route) {
    document.getElementById('content').innerHTML = '<h1>Page Not Found</h1>';
    return;
  }

  try {
    // Unload previous resources
    unloadResources();

    // Load and inject HTML content
    const response = await fetch(route.template);
    if (!response.ok) {
      throw new Error(`Failed to load ${route.template}: ${response.statusText}`);
    }
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const bodyContent = doc.body.innerHTML;
    document.getElementById('content').innerHTML = bodyContent;

    // Load styles and scripts dynamically
    const stylePromises = route.styles.map(async (stylePath) => {
      const link = await loadCSS(stylePath);
      loadedResources.styles.set(stylePath, link);
    });
    if (path === "/mainpage")
        loadScript(routes["/mainpage"].scripts);
        // console.log(routes["/game"].scripts);
        
    // const scriptPromises = route.scripts.map(async (scriptPath) => {
    //   const script = await loadScript(scriptPath);
    //   loadedResources.scripts.set(scriptPath, script);
    // });

    await Promise.all([...stylePromises]);

    // Update the document title if available
    const title = doc.querySelector('title');
    if (title) {
      document.title = title.textContent;
    }

  } catch (error) {
    console.error('Error loading content:', error);
    document.getElementById('content').innerHTML = '<h1>Page Not Found</h1>';
  }
}