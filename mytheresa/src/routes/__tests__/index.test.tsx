import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithQueryClient } from '../../test/utils'
import { server } from '../../test/mocks/server'
import { http, HttpResponse } from 'msw'

// Mock the Link component to avoid router dependency
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router')
  return {
    ...actual,
    Link: ({ children, to, title, className }: { 
      children: React.ReactNode; 
      to: string; 
      title?: string; 
      className?: string; 
    }) => (
      <a href={to} title={title} className={className}>{children}</a>
    ),
  }
})

import { HomePage } from '../index'

const mockMoviesResponse = {
  results: [
    {
      id: 1,
      title: 'Test Movie 1',
      poster_path: '/test1.jpg',
      release_date: '2023-01-01',
      vote_average: 8.5,
      overview: 'Test overview 1',
      backdrop_path: '/backdrop1.jpg',
    },
    {
      id: 2,
      title: 'Test Movie 2',
      poster_path: '/test2.jpg',
      release_date: '2023-02-01',
      vote_average: 7.8,
      overview: 'Test overview 2',
      backdrop_path: '/backdrop2.jpg',
    },
  ],
  page: 1,
  total_pages: 1,
  total_results: 2,
}

describe('HomePage Component', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    renderWithQueryClient(<HomePage />)

    expect(document.querySelector('.loading-spinner')).toBeInTheDocument()
  })

  it('renders error state when API fails', async () => {
    server.use(
      http.get('https://api.themoviedb.org/3/movie/popular', () => {
        return new HttpResponse(null, { status: 500 })
      }),
      http.get('https://api.themoviedb.org/3/movie/now_playing', () => {
        return new HttpResponse(null, { status: 500 })
      }),
      http.get('https://api.themoviedb.org/3/movie/top_rated', () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    renderWithQueryClient(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('Error loading movies. Please try again later.')).toBeInTheDocument()
    }, { timeout: 10000 })
  })

  it('renders movie carousels with data from API', async () => {
    server.use(
      http.get('https://api.themoviedb.org/3/movie/popular', () => {
        return HttpResponse.json(mockMoviesResponse)
      }),
      http.get('https://api.themoviedb.org/3/movie/now_playing', () => {
        return HttpResponse.json(mockMoviesResponse)
      }),
      http.get('https://api.themoviedb.org/3/movie/top_rated', () => {
        return HttpResponse.json(mockMoviesResponse)
      })
    )

    renderWithQueryClient(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('Popular Movies')).toBeInTheDocument()
      expect(screen.getByText('Now Playing')).toBeInTheDocument()
      expect(screen.getByText('Top Rated')).toBeInTheDocument()
    })

    // Check if movies are rendered (should appear 3 times, once per carousel)
    expect(screen.getAllByText('Test Movie 1')).toHaveLength(3)
    expect(screen.getAllByText('Test Movie 2')).toHaveLength(3)
  })

  it('renders movie cards with correct hover data', async () => {
    server.use(
      http.get('https://api.themoviedb.org/3/movie/popular', () => {
        return HttpResponse.json(mockMoviesResponse)
      }),
      http.get('https://api.themoviedb.org/3/movie/now_playing', () => {
        return HttpResponse.json(mockMoviesResponse)
      }),
      http.get('https://api.themoviedb.org/3/movie/top_rated', () => {
        return HttpResponse.json(mockMoviesResponse)
      })
    )

    renderWithQueryClient(<HomePage />)

    await waitFor(() => {
      // Check movie titles in hover overlays
      expect(screen.getAllByText('Test Movie 1')).toHaveLength(3)
      
      // Check release years
      expect(screen.getAllByText('2023')).toHaveLength(6) // 2 movies × 3 carousels
      
      // Check ratings
      expect(screen.getAllByText('⭐ 8.5')).toHaveLength(3) // Movie 1 in 3 carousels
      expect(screen.getAllByText('⭐ 7.8')).toHaveLength(3) // Movie 2 in 3 carousels
    })
  })

  it('handles empty movie results gracefully', async () => {
    const emptyResponse = { results: [], page: 1, total_pages: 0, total_results: 0 }
    
    server.use(
      http.get('https://api.themoviedb.org/3/movie/popular', () => {
        return HttpResponse.json(emptyResponse)
      }),
      http.get('https://api.themoviedb.org/3/movie/now_playing', () => {
        return HttpResponse.json(emptyResponse)
      }),
      http.get('https://api.themoviedb.org/3/movie/top_rated', () => {
        return HttpResponse.json(emptyResponse)
      })
    )

    renderWithQueryClient(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('Popular Movies')).toBeInTheDocument()
      expect(screen.getByText('Now Playing')).toBeInTheDocument()
      expect(screen.getByText('Top Rated')).toBeInTheDocument()
    })

    // Should not have any movie cards
    expect(screen.queryByText('Test Movie 1')).not.toBeInTheDocument()
  })

  it('limits movies to 20 per carousel', async () => {
    const manyMovies = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      title: `Movie ${i + 1}`,
      poster_path: `/poster${i + 1}.jpg`,
      release_date: '2023-01-01',
      vote_average: 8.0,
      overview: `Overview ${i + 1}`,
      backdrop_path: `/backdrop${i + 1}.jpg`,
    }))

    const manyMoviesResponse = {
      results: manyMovies,
      page: 1,
      total_pages: 1,
      total_results: 50,
    }

    server.use(
      http.get('https://api.themoviedb.org/3/movie/popular', () => {
        return HttpResponse.json(manyMoviesResponse)
      }),
      http.get('https://api.themoviedb.org/3/movie/now_playing', () => {
        return HttpResponse.json(manyMoviesResponse)
      }),
      http.get('https://api.themoviedb.org/3/movie/top_rated', () => {
        return HttpResponse.json(manyMoviesResponse)
      })
    )

    renderWithQueryClient(<HomePage />)

    await waitFor(() => {
      // Should only show movies 1-20 in each carousel
      expect(screen.getAllByText('Movie 1')).toHaveLength(3)
      expect(screen.getAllByText('Movie 20')).toHaveLength(3)
      expect(screen.queryByText('Movie 21')).not.toBeInTheDocument()
    })
  })

  it('renders movie cards with proper accessibility attributes', async () => {
    server.use(
      http.get('https://api.themoviedb.org/3/movie/popular', () => {
        return HttpResponse.json(mockMoviesResponse)
      }),
      http.get('https://api.themoviedb.org/3/movie/now_playing', () => {
        return HttpResponse.json(mockMoviesResponse)
      }),
      http.get('https://api.themoviedb.org/3/movie/top_rated', () => {
        return HttpResponse.json(mockMoviesResponse)
      })
    )

    renderWithQueryClient(<HomePage />)

    await waitFor(() => {
      // Check that movie cards have proper title attributes for accessibility
      const movieCards = screen.getAllByTitle('Test Movie 1')
      expect(movieCards).toHaveLength(3)
    })
  })
})