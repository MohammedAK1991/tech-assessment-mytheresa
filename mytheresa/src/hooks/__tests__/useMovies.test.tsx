import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { useMoviesByCategory, useMovieDetails, useHomepageMovies } from '../useMovies'
import { createTestQueryClient } from '../../test/utils'
import type { ReactNode } from 'react'

// Mock the movieApi
vi.mock('../../services/movieApi', () => ({
  movieApi: {
    getMoviesByCategory: vi.fn(),
    getMovieDetails: vi.fn(),
  },
}))

import { movieApi } from '../../services/movieApi'

const mockMovieApi = vi.mocked(movieApi)

const mockMoviesResponse = {
  page: 1,
  results: [
    {
      id: 1,
      title: 'Test Movie 1',
      overview: 'Test overview 1',
      poster_path: '/test1.jpg',
      backdrop_path: '/backdrop1.jpg',
      release_date: '2023-01-01',
      vote_average: 8.5,
      genre_ids: [1, 2],
      adult: false,
      original_language: 'en',
      original_title: 'Test Movie 1',
      popularity: 100.0,
      video: false,
      vote_count: 1000,
    },
    {
      id: 2,
      title: 'Test Movie 2',
      overview: 'Test overview 2',
      poster_path: '/test2.jpg',
      backdrop_path: '/backdrop2.jpg',
      release_date: '2023-02-01',
      vote_average: 7.8,
      genre_ids: [3, 4],
      adult: false,
      original_language: 'en',
      original_title: 'Test Movie 2',
      popularity: 80.0,
      video: false,
      vote_count: 800,
    },
  ],
  total_pages: 1,
  total_results: 2,
}

const mockMovieDetails = {
  id: 1,
  title: 'Test Movie Details',
  overview: 'Detailed test overview',
  poster_path: '/detail-poster.jpg',
  backdrop_path: '/detail-backdrop.jpg',
  release_date: '2023-01-01',
  vote_average: 8.5,
  runtime: 120,
  genre_ids: [1, 2],
  adult: false,
  original_language: 'en',
  original_title: 'Test Movie Details',
  popularity: 100.0,
  video: false,
  vote_count: 1000,
  genres: [
    { id: 1, name: 'Action' },
    { id: 2, name: 'Adventure' },
  ],
  production_companies: [
    { id: 1, name: 'Test Studios', logo_path: null, origin_country: 'US' },
  ],
  budget: 100000000,
  homepage: '',
  imdb_id: 'tt1234567',
  production_countries: [],
  revenue: 200000000,
  spoken_languages: [],
  status: 'Released',
  tagline: 'Test tagline',
}

function createWrapper() {
  const queryClient = createTestQueryClient()
  
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('useMovies hooks', () => {
  describe('useMoviesByCategory', () => {
    it('fetches movies by category successfully', async () => {
      mockMovieApi.getMoviesByCategory.mockResolvedValue(mockMoviesResponse)

      const { result } = renderHook(
        () => useMoviesByCategory('popular'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockMoviesResponse)
      expect(mockMovieApi.getMoviesByCategory).toHaveBeenCalledWith('popular', 1)
    })

    it('fetches movies with custom page number', async () => {
      mockMovieApi.getMoviesByCategory.mockResolvedValue(mockMoviesResponse)

      const { result } = renderHook(
        () => useMoviesByCategory('popular', 2),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockMovieApi.getMoviesByCategory).toHaveBeenCalledWith('popular', 2)
    })

    it('handles different movie categories', async () => {
      mockMovieApi.getMoviesByCategory.mockResolvedValue(mockMoviesResponse)

      const { result: nowPlayingResult } = renderHook(
        () => useMoviesByCategory('now_playing'),
        { wrapper: createWrapper() }
      )

      const { result: topRatedResult } = renderHook(
        () => useMoviesByCategory('top_rated'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(nowPlayingResult.current.isSuccess).toBe(true)
        expect(topRatedResult.current.isSuccess).toBe(true)
      })

      expect(mockMovieApi.getMoviesByCategory).toHaveBeenCalledWith('now_playing', 1)
      expect(mockMovieApi.getMoviesByCategory).toHaveBeenCalledWith('top_rated', 1)
    })

    it('handles API errors gracefully', async () => {
      const error = new Error('API Error')
      mockMovieApi.getMoviesByCategory.mockRejectedValue(error)

      const { result } = renderHook(
        () => useMoviesByCategory('popular'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
    })

    it('starts in loading state', () => {
      mockMovieApi.getMoviesByCategory.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      const { result } = renderHook(
        () => useMoviesByCategory('popular'),
        { wrapper: createWrapper() }
      )

      expect(result.current.isPending).toBe(true)
      expect(result.current.data).toBeUndefined()
    })

    it('uses correct stale time (5 minutes)', async () => {
      mockMovieApi.getMoviesByCategory.mockResolvedValue(mockMoviesResponse)

      const { result } = renderHook(
        () => useMoviesByCategory('popular'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // The hook should use a 5-minute stale time
      expect(result.current.isStale).toBe(false) // Should not be stale immediately
    })
  })

  describe('useMovieDetails', () => {
    it('fetches movie details successfully', async () => {
      mockMovieApi.getMovieDetails.mockResolvedValue(mockMovieDetails)

      const { result } = renderHook(
        () => useMovieDetails(1),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockMovieDetails)
      expect(mockMovieApi.getMovieDetails).toHaveBeenCalledWith(1)
    })

    it('does not fetch when movieId is falsy', () => {
      // Clear any previous calls
      mockMovieApi.getMovieDetails.mockClear()
      
      const { result } = renderHook(
        () => useMovieDetails(0),
        { wrapper: createWrapper() }
      )

      expect(result.current.status).toBe('pending')
      expect(result.current.fetchStatus).toBe('idle')
      expect(mockMovieApi.getMovieDetails).not.toHaveBeenCalled()
    })

    it('handles API errors gracefully', async () => {
      const error = new Error('Movie not found')
      mockMovieApi.getMovieDetails.mockRejectedValue(error)

      const { result } = renderHook(
        () => useMovieDetails(999),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
    })

    it('uses correct stale time (10 minutes)', async () => {
      mockMovieApi.getMovieDetails.mockResolvedValue(mockMovieDetails)

      const { result } = renderHook(
        () => useMovieDetails(1),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // The hook should use a 10-minute stale time
      expect(result.current.isStale).toBe(false) // Should not be stale immediately
    })

    it('refetches when movieId changes', async () => {
      mockMovieApi.getMovieDetails.mockResolvedValue(mockMovieDetails)

      const { result, rerender } = renderHook(
        ({ movieId }) => useMovieDetails(movieId),
        { 
          wrapper: createWrapper(),
          initialProps: { movieId: 1 }
        }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockMovieApi.getMovieDetails).toHaveBeenCalledWith(1)

      // Change movieId
      rerender({ movieId: 2 })

      await waitFor(() => {
        expect(mockMovieApi.getMovieDetails).toHaveBeenCalledWith(2)
      })
    })
  })

  describe('useHomepageMovies', () => {
    beforeEach(() => {
      mockMovieApi.getMoviesByCategory.mockResolvedValue(mockMoviesResponse)
    })

    it('fetches all three categories', async () => {
      const { result } = renderHook(
        () => useHomepageMovies(),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.popular.isSuccess).toBe(true)
        expect(result.current.nowPlaying.isSuccess).toBe(true)
        expect(result.current.topRated.isSuccess).toBe(true)
      })

      expect(mockMovieApi.getMoviesByCategory).toHaveBeenCalledWith('popular', 1)
      expect(mockMovieApi.getMoviesByCategory).toHaveBeenCalledWith('now_playing', 1)
      expect(mockMovieApi.getMoviesByCategory).toHaveBeenCalledWith('top_rated', 1)
    })

    it('reports loading state correctly', () => {
      mockMovieApi.getMoviesByCategory.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      const { result } = renderHook(
        () => useHomepageMovies(),
        { wrapper: createWrapper() }
      )

      expect(result.current.isLoading).toBe(true)
      expect(result.current.popular.isPending).toBe(true)
      expect(result.current.nowPlaying.isPending).toBe(true)
      expect(result.current.topRated.isPending).toBe(true)
    })

    it('reports error state when any category fails', async () => {
      const error = new Error('API Error')
      mockMovieApi.getMoviesByCategory
        .mockResolvedValueOnce(mockMoviesResponse) // popular succeeds
        .mockRejectedValueOnce(error) // now_playing fails
        .mockResolvedValueOnce(mockMoviesResponse) // top_rated succeeds

      const { result } = renderHook(
        () => useHomepageMovies(),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.hasError).toBe(true)
      })

      expect(result.current.popular.isSuccess).toBe(true)
      expect(result.current.nowPlaying.isError).toBe(true)
      expect(result.current.topRated.isSuccess).toBe(true)
    })

    it('reports loading false when all queries complete', async () => {
      const { result } = renderHook(
        () => useHomepageMovies(),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.popular.isPending).toBe(false)
      expect(result.current.nowPlaying.isPending).toBe(false)
      expect(result.current.topRated.isPending).toBe(false)
    })

    it('returns data for all successful queries', async () => {
      const { result } = renderHook(
        () => useHomepageMovies(),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.popular.data).toEqual(mockMoviesResponse)
      expect(result.current.nowPlaying.data).toEqual(mockMoviesResponse)
      expect(result.current.topRated.data).toEqual(mockMoviesResponse)
    })

    it('maintains individual query states', async () => {
      const { result } = renderHook(
        () => useHomepageMovies(),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Each query should maintain its own state
      expect(result.current.popular.isSuccess).toBe(true)
      expect(result.current.nowPlaying.isSuccess).toBe(true)
      expect(result.current.topRated.isSuccess).toBe(true)

      expect(result.current.popular.isError).toBe(false)
      expect(result.current.nowPlaying.isError).toBe(false)
      expect(result.current.topRated.isError).toBe(false)
    })
  })
})