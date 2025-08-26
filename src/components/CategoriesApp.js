export default class CategoriesApp {
  constructor({ target }) {
    this.target = target;
    this.categories = [];
    this.selectedCategory = '';
    this.isLoading = true;
    
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
    
    // Dispatch event to ProductsApp
    window.dispatchEvent(new CustomEvent('category-selected', { 
      detail: this.selectedCategory 
    }));
    
    this.render();
  }

  render() {
    if (this.isLoading) {
      this.target.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-32">
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
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-32">
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
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-32">
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