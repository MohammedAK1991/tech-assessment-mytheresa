# 🎬 LuxExperience Movie Application

> A premium movie browsing application with Server-Side Rendering (SSR) capabilities, built with modern React ecosystem.

**Author**: Mohammed Abdul Khader  
**Technology Stack**: React 19 + TypeScript + Vite + SSR  
**API Source**: The Movie Database (TMDB)  

---

## 🌟 Project Overview

This application demonstrates advanced frontend development skills with enterprise-grade architecture. Built specifically for the LuxExperience Frontend Engineer technical challenge, showcasing:

- **Modern React Development** with functional components and hooks
- **Type-Safe Development** using TypeScript throughout
- **Server-Side Rendering** for improved SEO and performance
- **Comprehensive Testing** with 83 passing tests (100% success rate)
- **Responsive Design** with SCSS architecture
- **State Management** using Zustand with persistence
- **API Integration** with TanStack Query for optimal data fetching

---

## 🚀 Quick Start Guide

### Prerequisites
Ensure you have these installed on your system:
```bash
node --version    # v18+ recommended
npm --version     # v8+ recommended
# OR
pnpm --version    # v8+ recommended (preferred)
```

### Environment Setup
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mytheresa
   ```

2. **Install dependencies**
   ```bash
   # Using pnpm (recommended)
   pnpm install
   
   # OR using npm
   npm install
   ```

3. **Environment configuration**
   ```bash
   # Create .env file in root directory
   echo "VITE_TMDB_API_KEY=your_tmdb_api_key_here" > .env
   echo "VITE_TMDB_BASE_URL=https://api.themoviedb.org/3" >> .env
   ```
   
   > **Note**: Get your free API key from [TMDB](https://www.themoviedb.org/settings/api)

---

## 🎯 Available Commands

### Development Commands
```bash
# Standard development server
pnpm dev                    # Runs on http://localhost:5173

# SSR development server  
pnpm dev:ssr               # Server-Side Rendered version

# Linting & Type checking
pnpm lint                  # ESLint code quality check
npx tsc --noEmit          # TypeScript type checking
```

### Production Commands
```bash
# Build for production
pnpm build                 # Builds both client and server

# Production preview
pnpm preview:ssr          # Preview production SSR build
```

### Testing Commands
```bash
# Run all tests
pnpm test:run             # Execute full test suite (83 tests)

# Test with UI
pnpm test:ui              # Interactive test runner

# Coverage report
pnpm test:coverage        # Generate detailed coverage report

# Watch mode (development)
pnpm test:watch           # Continuous testing during development
```

---

## 🏗️ Architecture Overview

### Project Structure
```
src/
├── components/           # Reusable UI components
│   └── Navigation.tsx   # Main navigation bar
├── hooks/               # Custom React hooks
│   └── useMovies.ts    # Movie data fetching logic
├── routes/              # File-based routing (TanStack Router)
│   ├── __root.tsx      # Root layout component
│   ├── index.tsx       # Homepage with carousels
│   ├── movie.$movieId.tsx  # Dynamic movie detail page
│   └── wishlist.tsx    # Wishlist management page
├── services/            # External API integration
│   └── movieApi.ts     # TMDB API service layer
├── stores/              # State management
│   └── wishlistStore.ts # Zustand store for wishlist
├── styles/              # SCSS architecture
│   ├── main.scss       # Global styles entry point
│   ├── _variables.scss # Design tokens & variables
│   ├── _mixins.scss    # Reusable SCSS mixins
│   └── _functions.scss # SCSS utility functions
├── test/                # Testing infrastructure
│   ├── setup.ts        # Global test configuration
│   └── mocks/          # MSW API mocking
├── types/               # TypeScript type definitions
│   └── movie.ts        # Movie-related interfaces
├── App.tsx             # Main application component
├── main.tsx            # Client-side entry point
└── entry-server.tsx    # Server-side entry point
```

### Technology Decisions

#### 🎨 **Styling Architecture**
- **SCSS with BEM methodology** for maintainable CSS
- **Design tokens** in `_variables.scss` for consistent theming
- **Responsive-first approach** with mobile breakpoints
- **Category-specific fonts** as per requirements:
  - Popular movies: Inter (modern sans-serif)
  - Now Playing: Georgia (elegant serif)  
  - Top Rated: Fira Code (distinctive monospace)

#### 🔄 **State Management Strategy**
- **TanStack Query** for server state (caching, background updates)
- **Zustand** for client state (wishlist persistence)
- **localStorage integration** for wishlist persistence across sessions

#### 🧪 **Testing Philosophy**
- **User-centric testing** with Testing Library
- **MSW for API mocking** (network-level mocking)
- **Comprehensive coverage**: Unit, Component, Integration, and Hook tests
- **83 passing tests** covering all critical user journeys

---

## 🎯 Feature Implementation

### 1. **Homepage with Carousels**
Three distinct movie categories as required:
- **Popular Movies** - Trending content
- **Now Playing** - Currently in theaters  
- **Top Rated** - Critically acclaimed films

Each carousel displays movie posters with hover effects and seamless navigation.

### 2. **Dynamic Movie Detail Pages**
URL pattern: `/movie/{movieId}`

**Category-Specific Styling**:
- **Different fonts** based on movie category
- **Unique button designs** per category
- **Consistent yet distinctive** visual identity

**Comprehensive Information Display**:
- High-quality backdrop images
- Movie metadata (release date, runtime, rating)
- Genre tags with styling
- Production company information
- Responsive layout for all screen sizes

### 3. **Wishlist Management**
- **Add/Remove functionality** with visual feedback
- **Persistent storage** using localStorage
- **State synchronization** across all components
- **Dedicated wishlist page** for management

### 4. **Server-Side Rendering (SSR)**
- **Express 4 server** with Vite SSR integration
- **Basic SSR implementation** with fallback rendering
- **Development and production builds** configured
- **SSR-ready architecture** for future enhancements

---

## 🔧 Development Features

### Hot Module Replacement (HMR)
During development, changes are reflected instantly without losing application state.

### Type Safety
Comprehensive TypeScript coverage ensures runtime reliability:
```typescript
interface MovieDetails extends Movie {
  runtime: number;
  genres: Genre[];
  production_companies: ProductionCompany[];
}
```

### API Integration
Robust TMDB API integration with error handling:
```typescript
// Automatic retry logic and caching
const { data: movie, isLoading, isError } = useMovieDetails(movieId)
```

### Responsive Design
Mobile-first CSS with breakpoints:
```scss
.movie-grid {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
```

---

## 🧪 Testing Strategy

### Test Categories & Coverage

#### **Unit Tests** 
- Pure function testing (API utilities)
- Business logic validation
- Edge case handling

#### **Component Tests** 
- UI rendering verification
- User interaction simulation
- Props and state testing

#### **Integration Tests** 
- Cross-component workflows
- API integration testing
- Store synchronization

#### **Hook Tests** 
- Custom hook behavior
- TanStack Query integration
- Error state handling

### Running Specific Test Suites
```bash
# Component tests only
pnpm test:run --grep "component"

# API integration tests
pnpm test:run --grep "movieApi"

# Wishlist functionality
pnpm test:run --grep "wishlist"
```

---

## 📱 Browser Support

### Primary Support
- **Chrome 90+** (Chromium-based browsers)
- **Firefox 88+** 
- **Safari 14+**
- **Edge 90+**

### Mobile Support
- **iOS Safari 14+**
- **Chrome Android 90+**
- **Samsung Internet 15+**

---

## 🚀 Performance Optimizations

### Bundle Optimization
- **Code splitting** with dynamic imports
- **Tree shaking** for minimal bundle size
- **Asset optimization** with Vite

### Runtime Performance
- **React.memo** for component optimization
- **TanStack Query caching** for reduced API calls
- **Image lazy loading** for faster initial load

### SSR Benefits
- **Faster First Contentful Paint (FCP)**
- **Better SEO** with pre-rendered content
- **Improved Core Web Vitals**

---

## 🔍 API Integration Details

### TMDB API Endpoints Used
```bash
# Popular movies
GET /movie/popular

# Now playing movies  
GET /movie/now_playing

# Top rated movies
GET /movie/top_rated

# Movie details
GET /movie/{movie_id}
```

### Rate Limiting Handling
- **Automatic retry** with exponential backoff
- **Request deduplication** via TanStack Query
- **Error boundaries** for graceful degradation

---

## 📈 Deployment Guide

### Production Build
```bash
# Complete production build
pnpm build

# Verify build
pnpm preview:ssr
```

### Environment Variables (Production)
```bash
VITE_TMDB_API_KEY=your_production_api_key
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
NODE_ENV=production
PORT=3000
```

### Server Requirements
- **Node.js 18+**
- **Memory**: 512MB minimum
- **Storage**: 100MB for application files

---

## 🐛 Troubleshooting

### Common Issues

#### **API Key Issues**
```bash
# Error: Unauthorized (401)
# Solution: Verify TMDB API key in .env file
echo $VITE_TMDB_API_KEY  # Should display your key
```

#### **Port Conflicts**
```bash
# Error: Port 5173 already in use
# Solution: Kill existing process or use different port
lsof -ti:5173 | xargs kill -9
# OR
PORT=3001 pnpm dev
```

#### **TypeScript Errors**
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
pnpm install
```

#### **Test Failures**
```bash
# Clear test cache and run again
pnpm test:run --no-cache
```

---

## 🔮 Future Enhancements

### Planned Features
- **Progressive Web App (PWA)** capabilities
- **Offline support** with service workers
- **Advanced filtering** by genre, year, rating
- **User authentication** and personalized recommendations
- **Social features** for sharing favorites

### Technical Improvements
- **GraphQL integration** for optimized data fetching
- **Micro-frontend architecture** for scalability
- **Advanced caching strategies** with Redis
- **Performance monitoring** with real user metrics

---

## 📜 License & Credits

### Technology Credits
- **React Team** for the amazing React framework
- **TanStack** for Query and Router libraries
- **Vercel Team** for Vite build tool
- **TMDB** for comprehensive movie database API

### Development Approach
This project follows modern React development patterns and industry best practices. Every architectural decision was made considering scalability, maintainability, and performance.

