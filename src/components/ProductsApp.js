export default class ProductsApp {
  constructor({ target, props = {} }) {
    this.target = target;
    this.searchInput = document.querySelector(props.searchInputSelector || '#search');
    this.products = [];
    this.filteredProducts = [];
    this.currentCategory = '';
    this.isLoading = false;
    
    this.init();
  }

  async init() {
    this.render();
    this.bindEvents();
    await this.fetchProducts();
  }

  bindEvents() {
    // Búsqueda
    if (this.searchInput) {
      this.searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
    }

    // Filtro por categoría
    window.addEventListener('category-selected', this.handleCategoryFilter.bind(this));
  }

  async fetchProducts() {
    this.isLoading = true;
    this.render();

    try {
      const response = await fetch('/api/catalogo');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      this.products = Array.isArray(data) ? data : [];
      this.filteredProducts = [...this.products];
      
    } catch (error) {
      console.error('Error fetching products:', error);
      this.products = [];
      this.filteredProducts = [];
    } finally {
      this.isLoading = false;
      this.render();
    }
  }

  handleSearch(event) {
    const query = event.target.value.trim().toLowerCase();
    this.filterProducts(query, this.currentCategory);
  }

  handleCategoryFilter(event) {
    this.currentCategory = event.detail || '';
    const query = this.searchInput ? this.searchInput.value.trim().toLowerCase() : '';
    this.filterProducts(query, this.currentCategory);
  }

  filterProducts(searchQuery = '', category = '') {
    this.filteredProducts = this.products.filter(product => {
      // Verificar que el producto tenga las propiedades necesarias
      if (!product || typeof product !== 'object') return false;

      const title = product.title || '';
      const sku = product.sku || '';
      const productCategory = product.category || '';
      const description = product.description || '';
      const material = product.material || '';

      // Búsqueda mejorada - incluye descripción y material
      const matchesSearch = !searchQuery ||
        title.toLowerCase().includes(searchQuery) ||
        sku.toLowerCase().includes(searchQuery) ||
        productCategory.toLowerCase().includes(searchQuery) ||
        description.toLowerCase().includes(searchQuery) ||
        material.toLowerCase().includes(searchQuery);

      const matchesCategory = !category ||
        productCategory.toLowerCase() === category.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    // Ordenar productos por relevancia si hay búsqueda
    if (searchQuery) {
      this.filteredProducts.sort((a, b) => {
        const aTitle = (a.title || '').toLowerCase();
        const bTitle = (b.title || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        
        // Priorizar coincidencias exactas en el título
        const aExactMatch = aTitle.includes(query);
        const bExactMatch = bTitle.includes(query);
        
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;
        
        // Si ambos o ninguno coincide exactamente, ordenar alfabéticamente
        return aTitle.localeCompare(bTitle);
      });
    }

    this.render();
  }

  render() {
    if (this.isLoading) {
      this.target.innerHTML = this.renderLoading();
      return;
    }

    if (!this.filteredProducts.length) {
      this.target.innerHTML = this.renderEmpty();
      return;
    }

    this.target.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger-in">
        ${this.filteredProducts.map(product => this.renderProductCard(product)).join('')}
      </div>
    `;

    // Temporalmente desactivado para debuggear
    // this.setupLazyLoading();
  }

  renderProductCard(product) {
    // Validar que el producto tenga los datos mínimos necesarios
    if (!product || !product.id) {
      return '';
    }

    const primaryImage = (product.images && product.images[0]) || '/assets/placeholder.svg';
    const title = product.title || 'Sin título';
    const sku = product.sku || 'N/A';
    const category = product.category || 'Sin categoría';
    const material = product.material || 'Material no especificado';

    return `
      <article class="group bg-white rounded-xl shadow-sm hover:shadow-lg hover-scale transition-all duration-300 overflow-hidden border border-gray-100">
        <a href="/product/${encodeURIComponent(product.id)}" class="block">
          <div class="relative overflow-hidden aspect-square bg-gray-50">
            <img
              src="${this.escapeHtml(primaryImage)}"
              alt="${this.escapeHtml(title)}"
              class="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
              onerror="this.src='/assets/placeholder.svg';"
            >
            <div class="absolute top-3 left-3">
              <span class="inline-block px-2 py-1 text-xs font-medium bg-white/90 text-gray-800 rounded-md backdrop-blur-sm shadow-sm">
                ${this.escapeHtml(category)}
              </span>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-black/0 group-hover:from-black/5 transition-all duration-300"></div>
          </div>
          <div class="p-4">
            <div class="text-xs text-gray-500 mb-1 font-mono">${this.escapeHtml(sku)}</div>
            <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gold-600 transition-colors duration-200 leading-tight">
              ${this.escapeHtml(title)}
            </h3>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gold-600 font-medium">${this.escapeHtml(material)}</span>
              <div class="opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-1 group-hover:translate-x-0">
                <svg class="w-4 h-4 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </div>
        </a>
      </article>
    `;
  }


  renderLoading() {
    return `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger-in">
        ${Array(6).fill(0).map((_, index) => `
          <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100" style="animation-delay: ${index * 100}ms">
            <div class="aspect-square loading-shimmer bg-gray-100"></div>
            <div class="p-4 space-y-3">
              <div class="flex items-center justify-between">
                <div class="h-2 skeleton w-16"></div>
                <div class="h-2 skeleton w-8"></div>
              </div>
              <div class="h-4 skeleton w-4/5"></div>
              <div class="h-3 skeleton w-3/5"></div>
              <div class="flex items-center justify-between pt-2">
                <div class="h-3 skeleton w-20"></div>
                <div class="h-3 skeleton w-3"></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="flex justify-center items-center mt-8">
        <div class="loading-spinner"></div>
        <span class="ml-3 text-gray-600 text-sm">Cargando productos...</span>
      </div>
    `;
  }

  renderEmpty() {
    return `
      <div class="text-center py-16 animate-slide-up">
        <div class="text-6xl mb-6 animate-pulse">💎</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">No se encontraron productos</h3>
        <p class="text-gray-600 mb-6">Intenta con otros términos de búsqueda o selecciona una categoría diferente.</p>
        <div class="flex justify-center space-x-2 text-sm text-gray-500">
          <span class="px-3 py-1 bg-gray-100 rounded-full">Sugerencia: busca por "anillo"</span>
          <span class="px-3 py-1 bg-gray-100 rounded-full">o por "collar"</span>
        </div>
      </div>
    `;
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  setupLazyLoading() {
    const lazyImages = this.target.querySelectorAll('.lazy-image');
    
    // Si no hay soporte para IntersectionObserver, cargar todas las imágenes inmediatamente
    if (!('IntersectionObserver' in window)) {
      lazyImages.forEach(img => {
        const src = img.getAttribute('data-src');
        if (src) {
          img.src = src;
          img.style.opacity = '1';
        }
      });
      return;
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          
          if (src) {
            // Crear una nueva imagen para precargar
            const newImg = new Image();
            newImg.onload = () => {
              img.src = src;
              img.style.opacity = '1';
              observer.unobserve(img);
            };
            newImg.onerror = () => {
              img.src = '/assets/placeholder.svg';
              img.style.opacity = '1';
              observer.unobserve(img);
            };
            newImg.src = src;
          }
        }
      });
    }, {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    });

    lazyImages.forEach(img => imageObserver.observe(img));
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
    if (this.searchInput) {
      this.searchInput.removeEventListener('input', this.handleSearch);
    }
    window.removeEventListener('category-selected', this.handleCategoryFilter);
  }
}