// Simple internationalization utility

const I18n = {
  currentLanguage: 'en', // Default language
  translations: {},
  
  // Initialize the translation system
  init: function(defaultLanguage = 'en') {
    // Set default language
    this.currentLanguage = defaultLanguage || 'en';
    
    // Try to load saved language preference
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      this.currentLanguage = savedLanguage;
    }
    
    // Load translations
    this.loadTranslations(this.currentLanguage);
    
    console.log(`Initialized i18n with language: ${this.currentLanguage}`);
  },
  
  // Load translations for a specific language
  loadTranslations: function(language) {
    fetch(`/locales/${language}.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load translations for ${language}`);
        }
        return response.json();
      })
      .then(data => {
        this.translations = data;
        console.log(`Loaded translations for ${language}`);
        
        // Trigger an event to notify that translations are loaded
        document.dispatchEvent(new CustomEvent('translationsLoaded', {
          detail: { language }
        }));
        
        // Update the UI
        this.updateUI();
      })
      .catch(error => {
        console.error('Error loading translations:', error);
        
        // If failed, try loading English as fallback
        if (language !== 'en') {
          console.log('Falling back to English translations');
          this.loadTranslations('en');
        }
      });
  },
  
  // Change the current language
  setLanguage: function(language) {
    this.currentLanguage = language;
    localStorage.setItem('language', language);
    this.loadTranslations(language);
  },
  
  // Get a translation by key (supports nested keys using dot notation)
  t: function(key) {
    // Split the key by dots to access nested properties
    const keys = key.split('.');
    let value = this.translations;
    
    // Navigate through the nested objects
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Return the key itself if translation not found
      }
    }
    
    return value;
  },
  
  // Update UI elements with data-i18n attributes
  updateUI: function() {
    // Find all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      // Update element content
      element.textContent = translation;
    });
    
    // Handle placeholders
    const inputs = document.querySelectorAll('[data-i18n-placeholder]');
    inputs.forEach(input => {
      const key = input.getAttribute('data-i18n-placeholder');
      const translation = this.t(key);
      
      // Update placeholder
      input.placeholder = translation;
    });
  }
};

// Export the I18n object for global use
window.I18n = I18n;

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  I18n.init();
  
  // Add language switcher event listeners if they exist
  const languageSwitchers = document.querySelectorAll('[data-language]');
  languageSwitchers.forEach(switcher => {
    switcher.addEventListener('click', function() {
      const language = this.getAttribute('data-language');
      I18n.setLanguage(language);
    });
  });
}); 