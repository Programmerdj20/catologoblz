export default class CategoriesApp {
  constructor({ target, props = {} }) {
    this.target = target;
    this.isMobile = props.isMobile || false;
    this.categories = [];
    this.selectedCategory = '';
    this.isLoading = true;
    this.isOpen = false; // Para el dropdown móvil
    
    this.init();
  }

  async init() {
    this.render();
    await this.fetchCategories();
  }

  async fetchCategories() {
    try {
      console.log('Fetching categories...');
      const response = await fetch('/api/catalogo');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const products = await response.json();
      console.log('Products received:', products.length);
      
      const categorySet = new Set();
      
      products.forEach(product => {
        if (product.category && product.category.trim()) {
          categorySet.add(product.category.trim());
        }
      });
      
      this.categories = Array.from(categorySet).sort();
      this.isLoading = false;
      console.log('Categories loaded:', this.categories);
      this.render();
      
    } catch (error) {
      console.error('Error fetching categories:', error);
      this.isLoading = false;
      this.categories = [];
      this.render();
    }
  }

  handleCategoryClick(category) {
    this.selectedCategory = this.selectedCategory === category ? '' : category;
    console.log('Category selected:', this.selectedCategory);
    
    // Close mobile dropdown after selection
    if (this.isMobile) {
      this.isOpen = false;
    }
    
    // Dispatch event to ProductsApp
    window.dispatchEvent(new CustomEvent('category-selected', { 
      detail: this.selectedCategory 
    }));
    
    this.render();
  }

  render() {
    if (this.isMobile) {
      this.renderMobile();
    } else {
      this.renderDesktop();
    }
  }

  renderMobile() {
    if (this.isLoading) {
      this.target.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div class="flex items-center justify-between">
            <div class="animate-pulse flex-1">
              <div class="h-10 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 skeleton rounded-lg"></div>
            </div>
            <div class="ml-3 animate-pulse">
              <div class="h-10 w-10 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 skeleton rounded-lg"></div>
            </div>
          </div>
        </div>
      `;
      return;
    }
    
    this.target.innerHTML = `
      <div class="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div class="flex items-center p-4 gap-3">
          <!-- Barra de búsqueda -->
          <div class="flex-1 relative">
            <input 
              id="mobile-search" 
              type="text"
              placeholder="Buscar productos..." 
              class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-300 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500 text-sm"
            >
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
          
          <!-- Botón hamburguesa -->
          <button 
            id="mobile-hamburger-btn"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg 
              class="w-6 h-6 text-gray-600 transition-transform duration-200 ${this.isOpen ? 'rotate-90' : ''}" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        <!-- Menú desplegable -->
        <div 
          id="mobile-menu"
          class="transition-all duration-300 ease-in-out overflow-hidden ${
            this.isOpen 
              ? 'max-h-80 opacity-100 border-t border-gray-200' 
              : 'max-h-0 opacity-0'
          }"
        >
          <div class="max-h-72 overflow-y-auto p-3 space-y-1">
            <button
              data-category=""
              class="mobile-category-btn w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                !this.selectedCategory
                  ? 'bg-gradient-to-r from-gold-100 to-gold-50 text-gold-800 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }"
            >
              Todas las categorías
            </button>
            ${this.categories.map(category => `
              <button
                data-category="${this.escapeHtml(category)}"
                class="mobile-category-btn w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  this.selectedCategory === category
                    ? 'bg-gradient-to-r from-gold-100 to-gold-50 text-gold-800 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }"
              >
                ${this.escapeHtml(category)}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.bindMobileEvents();
  }

  renderDesktop() {
    if (this.isLoading) {
      this.target.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-2 mb-6">
            <div class="w-1 h-6 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full"></div>
            <h4 class="text-lg font-bold text-gray-900 tracking-wide">CATEGORÍAS</h4>
          </div>
          <div class="space-y-3">
            ${Array(5).fill(0).map((_, index) => `
              <div class="animate-pulse" style="animation-delay: ${index * 100}ms">
                <div class="h-12 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 skeleton rounded-xl"></div>
              </div>
            `).join('')}
          </div>
          <div class="mt-6 pt-4 border-t border-gray-100">
            <div class="flex items-center justify-center gap-2 text-gray-500">
              <div class="w-3 h-3 border border-gold-300 border-t-transparent rounded-full animate-spin"></div>
              <span class="text-xs">Cargando categorías...</span>
            </div>
          </div>
        </div>
      `;
      return;
    }

    if (this.categories.length === 0) {
      this.target.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-2 mb-6">
            <div class="w-1 h-6 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full"></div>
            <h4 class="text-lg font-bold text-gray-900 tracking-wide">CATEGORÍAS</h4>
          </div>
          <div class="text-center py-8">
            <div class="text-gray-500 text-sm">
              No se encontraron categorías
            </div>
          </div>
        </div>
      `;
      return;
    }

    this.target.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center gap-2 mb-6">
          <div class="w-1 h-6 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full"></div>
          <h4 class="text-lg font-bold text-gray-900 tracking-wide">CATEGORÍAS</h4>
        </div>
        <div class="space-y-2">
          <button
            data-category=""
            class="category-btn w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-300 group ${
              !this.selectedCategory
                ? 'bg-gradient-to-r from-gold-100 to-gold-50 text-gold-800 font-semibold shadow-sm border border-gold-200'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200'
            }"
          >
            <div class="flex items-center justify-between">
              <span>Todas las categorías</span>
              <div class="w-2 h-2 rounded-full bg-gold-400 ${!this.selectedCategory ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200"></div>
            </div>
          </button>
          ${this.categories.map(category => `
            <button
              data-category="${this.escapeHtml(category)}"
              class="category-btn w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-300 group ${
                this.selectedCategory === category
                  ? 'bg-gradient-to-r from-gold-100 to-gold-50 text-gold-800 font-semibold shadow-sm border border-gold-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200'
              }"
            >
              <div class="flex items-center justify-between">
                <span>${this.escapeHtml(category)}</span>
                <div class="w-2 h-2 rounded-full bg-gold-400 ${this.selectedCategory === category ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200"></div>
              </div>
            </button>
          `).join('')}
        </div>

        <!-- Decoración inferior -->
        <div class="mt-6 pt-4 border-t border-gray-100">
          <div class="text-xs text-gray-500 text-center">
            ${this.categories.length} categorías disponibles
          </div>
        </div>
      </div>
    `;

    // Bind events after rendering
    this.bindEvents();
  }

  bindEvents() {
    const buttons = this.target.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const category = btn.dataset.category || '';
        this.handleCategoryClick(category);
      });
    });
  }

  bindMobileEvents() {
    // Toggle dropdown
    const toggleBtn = this.target.querySelector('#mobile-category-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.isOpen = !this.isOpen;
        this.render();
      });
    }

    // Category selection
    const categoryButtons = this.target.querySelectorAll('.mobile-category-btn');
    categoryButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const category = btn.dataset.category || '';
        this.handleCategoryClick(category);
        this.isOpen = false; // Close dropdown after selection
      });
    });
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text || '').replace(/[&<>"']/g, m => map[m]);
  }

  destroy() {
    // Cleanup if needed
    this.target.innerHTML = '';
  }
}