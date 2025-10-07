# 💎 Catálogo de Joyería - Oro Laminado 18K

Un catálogo web moderno y elegante para mostrar productos de joyería, construido con **Astro 3.0**, **TypeScript** y **Tailwind CSS**.

## ✨ Características

- 🎨 **Diseño moderno** con animaciones suaves y efectos hover
- 📱 **Totalmente responsive** - se adapta a todos los dispositivos
- 🔍 **Búsqueda en tiempo real** con filtrado por categorías
- 🖼️ **Galería de imágenes** con vista previa y thumbnails
- ⚡ **Carga rápida** con lazy loading y optimizaciones
- 🔒 **API segura** con autenticación básica
- 🎯 **SEO optimizado** con meta tags y Open Graph
- ♿ **Accesible** siguiendo estándares web

## 🚀 Tecnologías

- **[Astro 3.0](https://astro.build/)** - Framework web moderno
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utility-first
- **[Node.js](https://nodejs.org/)** - Runtime de JavaScript

## 📦 Instalación

1. **Clona el repositorio:**
   ```bash
   git clone <repository-url>
   cd jewelry-catalog
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   
   Edita el archivo `.env` con tus credenciales de API:
   ```env
   ASTRO_API_URL=https://tu-api-endpoint.com/products
   ASTRO_API_USER=tu_usuario
   ASTRO_API_PASS=tu_contraseña
   ```

4. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

5. **Abre tu navegador en:** `http://localhost:4321`

## 🏗️ Estructura del Proyecto

```
jewelry-catalog/
├── src/
│   ├── components/           # Componentes reutilizables
│   │   ├── Layout.astro     # Layout principal
│   │   ├── Header.astro     # Cabecera con búsqueda
│   │   ├── Banner.astro     # Banner promocional
│   │   ├── ProductCard.astro # Tarjeta de producto
│   │   ├── CategoriesApp.js # App de categorías
│   │   └── ProductsApp.js   # App de productos
│   ├── pages/               # Páginas del sitio
│   │   ├── index.astro      # Página principal
│   │   ├── product/         # Páginas de productos
│   │   │   └── [id].astro   # Detalle de producto
│   │   └── api/             # Endpoints de API
│   │       └── catalogo.ts  # API del catálogo
│   └── styles/              # Estilos globales
│       └── global.css       # CSS personalizado
├── public/                  # Archivos estáticos
│   ├── assets/              # Imágenes y recursos
│   └── favicon.svg          # Favicon
├── tailwind.config.js       # Configuración de Tailwind
├── astro.config.mjs         # Configuración de Astro
└── package.json             # Dependencias del proyecto
```

## 🎨 Personalización

### Colores
Los colores están definidos en `tailwind.config.js`:
```javascript
colors: {
  gold: {
    50: '#fffbf0',   // Muy claro
    600: '#d9980a',  // Principal
    700: '#b67706'   // Hover
  }
}
```

### Fuentes
Se utiliza **Inter** como fuente principal, cargada desde Google Fonts.

### Animaciones
Las animaciones están definidas en `src/styles/global.css`:
- `loading-shimmer` - Efecto de carga
- `animate-fade-in` - Aparición suave
- Transiciones suaves en hover

## 🔧 API

El endpoint `/api/catalogo` acepta los siguientes parámetros:

- `id` - ID específico del producto
- `category` - Filtrar por categoría

### Formato de Producto
```typescript
interface Product {
  id: string;
  title: string;
  sku: string;
  category: string;
  description: string;
  images: string[];
  material: string;
}
```

## 📱 Características Responsive

- **Mobile First** - Diseñado primero para móviles
- **Breakpoints:**
  - `sm`: 640px+
  - `md`: 768px+
  - `lg`: 1024px+
  - `xl`: 1280px+

## 🚀 Despliegue

### Build de Producción
```bash
npm run build
```

### Vista Previa
```bash
npm run preview
```

### Despliegue en Vercel/Netlify
El proyecto está listo para desplegarse en plataformas como Vercel o Netlify. Solo asegúrate de configurar las variables de entorno en tu plataforma.

## 🔍 SEO

- Meta tags optimizados
- Open Graph para redes sociales
- Structured data (JSON-LD) ready
- URLs amigables
- Lazy loading de imágenes

## ♿ Accesibilidad

- Navegación por teclado
- Alt text en imágenes
- Contraste de colores WCAG AA
- Roles ARIA apropiados
- Focus indicators visibles

## 🐛 Solución de Problemas

### Error de API
Si ves errores de API, verifica:
1. Variables de entorno configuradas correctamente
2. URL de API accesible
3. Credenciales válidas

### Imágenes no cargan
- Verifica que las URLs de imágenes sean válidas
- El sistema incluye fallback a placeholder automáticamente

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes preguntas o necesitas ayuda, puedes:
- Abrir un issue en GitHub
- Contactar al equipo de desarrollo

---

**Hecho con ❤️ para Joyería Belatriz**