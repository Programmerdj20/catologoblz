# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern jewelry catalog website built with **Astro 3.0**, **TypeScript**, and **Tailwind CSS**. The project showcases gold-plated jewelry (18K) from Joyería Belatriz with real-time search, category filtering, and a responsive gallery system.

## Development Commands

```bash
# Start development server (runs on port 4321)
npm run dev
npm run start    # Alternative

# Build for production
npm run build

# Preview production build
npm run preview

# Check code with Astro and format with Prettier
npm run check
npm run lint

# Format code
npm run format
```

## Architecture

### Stack
- **Astro 3.0**: Server-side rendering with component islands
- **TypeScript**: Type safety throughout the application  
- **Tailwind CSS**: Utility-first styling with custom gold color palette
- **Node.js adapter**: Server-side rendering in standalone mode

### Key Components
- `src/components/ProductsApp.js`: Vanilla JS class handling product display, search, and filtering
- `src/components/CategoriesApp.js`: Category filtering system
- `src/pages/api/catalogo.ts`: API endpoint that fetches from external jewelry API
- `src/components/ProductCard.astro`: Individual product display component

### API Integration
The application connects to an external jewelry API at `belatrizcolombia.com/apirest/public/catalago2`. The API endpoint in `src/pages/api/catalogo.ts` handles:
- Authentication with Basic Auth
- Data normalization from external API response format
- Image URL construction and fallback to placeholder
- Product filtering by ID or category

### Styling System
- **Custom color palette**: Gold shades defined in `tailwind.config.mjs` (gold-50 to gold-900)
- **Custom animations**: `fade-in` and `slide-up` defined in Tailwind config
- **Responsive design**: Mobile-first approach with standard Tailwind breakpoints
- **Loading states**: Shimmer animations defined in `src/styles/global.css`

### Environment Configuration
The project expects these environment variables (though currently hardcoded in the API file):
- `ASTRO_API_URL`: External API endpoint
- `ASTRO_API_USER`: API authentication user
- `ASTRO_API_PASS`: API authentication password

### Image Handling
- Remote images from `belatrizcolombia.com` domain
- Automatic fallback to placeholder images on load failure
- Lazy loading implemented for performance
- Hover effects showing secondary product images

### Development Notes
- Server runs on port 4321
- Uses standalone Node.js adapter for deployment
- Dev toolbar disabled in development
- Images domains whitelisted in Astro config
- CSS base styles disabled to allow custom styling
- lee, pregunta y responde en espanol
- tienes el rol de desarrollador web fullstack con mas de 20 anos de experiencia