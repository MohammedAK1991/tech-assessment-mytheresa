import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { movieApi } from '../movieApi'
import { server } from '../../test/mocks/server'
import { http, HttpResponse } from 'msw'

// Mock environment variable
vi.mock('import.meta', () => ({
  env: {
    VITE_TMDB_API_KEY: 'test-api-key',
  },
}))

const BASE_URL = 'https://api.themoviedb.org/3'

describe('MovieApiService', () => {
  beforeEach(() => {
    // Reset any request handlers we may add during a test
    server.resetHandlers()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getMoviesByCategory', () => {
    it('fetches popular movies successfully', async () => {
      const result = await movieApi.getMoviesByCategory('popular')

      expect(result).toHaveProperty('page')
      expect(result).toHaveProperty('results')
      expect(result).toHaveProperty('total_pages')
      expect(result).toHaveProperty('total_results')
      expect(Array.isArray(result.results)).toBe(true)
      expect(result.results.length).toBeGreaterThan(0)
    })

    it('fetches now playing movies successfully', async () => {
      const result = await movieApi.getMoviesByCategory('now_playing')

      expect(result).toHaveProperty('results')
      expect(Array.isArray(result.results)).toBe(true)
    })

    it('fetches top rated movies successfully', async () => {
      const result = await movieApi.getMoviesByCategory('top_rated')

      expect(result).toHaveProperty('results')
      expect(Array.isArray(result.results)).toBe(true)
    })

    it('fetches movies with specific page number', async () => {
      // Add a handler for page 2
      server.use(
        http.get(`${BASE_URL}/movie/popular`, ({ request }) => {
          const url = new URL(request.url)
          const page = url.searchParams.get('page')
          
          if (page === '2') {
            return HttpResponse.json({
              page: 2,
              results: [
                {
                  id: 100,
                  title: 'Page 2 Movie',
                  overview: 'Movie from page 2',
                  poster_path: '/page2.jpg',
                  backdrop_path: '/page2-backdrop.jpg',
                  release_date: '2023-03-01',
                  vote_average: 9.0,
                },
              ],
              total_pages: 2,
              total_results: 21,
            })
          }
          
          return HttpResponse.json({
            page: 1,
            results: [],
            total_pages: 1,
            total_results: 0,
          })
        })
      )

      const result = await movieApi.getMoviesByCategory('popular', 2)

      expect(result.page).toBe(2)
      expect(result.results[0].title).toBe('Page 2 Movie')
    })

    it('handles API errors gracefully', async () => {
      server.use(
        http.get(`${BASE_URL}/movie/popular`, () => {
          return new HttpResponse(null, { status: 500 })
        })
      )

      await expect(movieApi.getMoviesByCategory('popular')).rejects.toThrow('HTTP error! status: 500')
    })

    it('handles network errors gracefully', async () => {
      server.use(
        http.get(`${BASE_URL}/movie/popular`, () => {
          return HttpResponse.error()
        })
      )

      await expect(movieApi.getMoviesByCategory('popular')).rejects.toThrow()
    })

    it('sends correct headers in request', async () => {
      let capturedHeaders: Record<string, string> = {}

      server.use(
        http.get(`${BASE_URL}/movie/popular`, ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries())
          return HttpResponse.json({
            page: 1,
            results: [],
            total_pages: 1,
            total_results: 0,
          })
        })
      )

      await movieApi.getMoviesByCategory('popular')

      // Headers might be lowercased by fetch or have different casing
      const contentType = capturedHeaders['content-type'] || capturedHeaders['Content-Type']
      const accept = capturedHeaders['accept'] || capturedHeaders['Accept']
      const authorization = capturedHeaders['authorization'] || capturedHeaders['Authorization']
      
      expect(contentType).toBe('application/json')
      expect(accept).toBe('application/json')
      expect(authorization).toMatch(/^Bearer /) // Just check it starts with "Bearer "
    })
  })

  describe('getMovieDetails', () => {
    it('fetches movie details successfully', async () => {
      const result = await movieApi.getMovieDetails(1)

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('title')
      expect(result).toHaveProperty('overview')
      expect(result).toHaveProperty('genres')
      expect(result).toHaveProperty('production_companies')
      expect(result.id).toBe(1)
    })

    it('handles different movie IDs', async () => {
      const result = await movieApi.getMovieDetails(42)

      expect(result.id).toBe(42)
      expect(result.title).toBe('Movie 42')
    })

    it('handles non-existent movie (404)', async () => {
      await expect(movieApi.getMovieDetails(999)).rejects.toThrow('HTTP error! status: 404')
    })

    it('handles API errors', async () => {
      server.use(
        http.get(`${BASE_URL}/movie/:movieId`, () => {
          return new HttpResponse(null, { status: 500 })
        })
      )

      await expect(movieApi.getMovieDetails(1)).rejects.toThrow('HTTP error! status: 500')
    })
  })

  describe('Image URL helpers', () => {
    describe('getImageUrl', () => {
      it('returns correct URL with default size', () => {
        const url = movieApi.getImageUrl('/example.jpg')
        expect(url).toBe('https://image.tmdb.org/t/p/w500/example.jpg')
      })

      it('returns correct URL with custom size', () => {
        const url = movieApi.getImageUrl('/example.jpg', 'w1280')
        expect(url).toBe('https://image.tmdb.org/t/p/w1280/example.jpg')
      })

      it('returns null for null path', () => {
        const url = movieApi.getImageUrl(null)
        expect(url).toBeNull()
      })

      it('returns null for empty string path', () => {
        const url = movieApi.getImageUrl('')
        expect(url).toBeNull()
      })

      it('handles paths with leading slash', () => {
        const url = movieApi.getImageUrl('/poster.jpg')
        expect(url).toBe('https://image.tmdb.org/t/p/w500/poster.jpg')
      })

      it('handles paths without leading slash', () => {
        const url = movieApi.getImageUrl('poster.jpg')
        expect(url).toBe('https://image.tmdb.org/t/p/w500poster.jpg')
      })
    })

    describe('getPosterUrl', () => {
      it('returns poster URL with w500 size', () => {
        const url = movieApi.getPosterUrl('/poster.jpg')
        expect(url).toBe('https://image.tmdb.org/t/p/w500/poster.jpg')
      })

      it('returns null for null poster path', () => {
        const url = movieApi.getPosterUrl(null)
        expect(url).toBeNull()
      })
    })

    describe('getBackdropUrl', () => {
      it('returns backdrop URL with w1280 size', () => {
        const url = movieApi.getBackdropUrl('/backdrop.jpg')
        expect(url).toBe('https://image.tmdb.org/t/p/w1280/backdrop.jpg')
      })

      it('returns null for null backdrop path', () => {
        const url = movieApi.getBackdropUrl(null)
        expect(url).toBeNull()
      })
    })
  })

  describe('Edge cases and error handling', () => {
    it('handles malformed JSON response', async () => {
      server.use(
        http.get(`${BASE_URL}/movie/popular`, () => {
          return new HttpResponse('invalid json', {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        })
      )

      await expect(movieApi.getMoviesByCategory('popular')).rejects.toThrow()
    })

    it('handles empty response body', async () => {
      server.use(
        http.get(`${BASE_URL}/movie/popular`, () => {
          return new HttpResponse('', { status: 200 })
        })
      )

      await expect(movieApi.getMoviesByCategory('popular')).rejects.toThrow()
    })

    it('logs errors to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      server.use(
        http.get(`${BASE_URL}/movie/popular`, () => {
          return new HttpResponse(null, { status: 500 })
        })
      )

      try {
        await movieApi.getMoviesByCategory('popular')
      } catch (error) {
        // Expected to throw
      }

      expect(consoleSpy).toHaveBeenCalledWith('Movie API fetch error:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })
})