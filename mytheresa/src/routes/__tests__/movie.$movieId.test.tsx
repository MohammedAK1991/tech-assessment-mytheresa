import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '../../test/utils'
import { server } from '../../test/mocks/server'
import { http, HttpResponse } from 'msw'
import { MovieDetailPage } from '../movie.$movieId'

const mockMovieDetails = {
  id: 1,
  title: 'Test Movie',
  overview: 'This is a test movie overview.',
  backdrop_path: '/test-backdrop.jpg',
  release_date: '2023-01-01',
  vote_average: 8.5,
  runtime: 120,
  genres: [
    { id: 1, name: 'Action' },
    { id: 2, name: 'Adventure' },
  ],
  production_companies: [
    { id: 1, name: 'Test Studios', logo_path: null, origin_country: 'US' },
    { id: 2, name: 'Another Studio', logo_path: null, origin_country: 'US' },
  ],
}

describe('MovieDetailPage Component', () => {
  const user = userEvent.setup()

  beforeEach(async () => {
    // Clear wishlist before each test
    const { useWishlistStore } = await import('../../stores/wishlistStore')
    useWishlistStore.getState().removeMovie(1) // Clear any existing state
  })

  it('renders loading state initially', () => {
    renderWithQueryClient(<MovieDetailPage movieId="1" />)

    expect(document.querySelector('.loading-spinner')).toBeInTheDocument()
  })

  it('renders error state when API fails', async () => {
    server.use(
      http.get('https://api.themoviedb.org/3/movie/1', () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    renderWithQueryClient(<MovieDetailPage movieId="1" />)

    await waitFor(() => {
      expect(screen.getByText('Movie Not Found')).toBeInTheDocument()
      expect(screen.getByText("Sorry, we couldn't find the movie you're looking for.")).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('renders movie details when data is loaded from API', async () => {
    server.use(
      http.get('https://api.themoviedb.org/3/movie/1', () => {
        return HttpResponse.json(mockMovieDetails)
      })
    )

    renderWithQueryClient(<MovieDetailPage movieId="1" />)

    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument()
      expect(screen.getByText('This is a test movie overview.')).toBeInTheDocument()
      expect(screen.getByText('2023')).toBeInTheDocument()
      expect(screen.getAllByText('⭐ 8.5/10')).toHaveLength(2) // Appears in meta and additional info sections
      expect(screen.getByText('120 min')).toBeInTheDocument()
    })
  })

  it('renders genres correctly', async () => {
    server.use(
      http.get('https://api.themoviedb.org/3/movie/1', () => {
        return HttpResponse.json(mockMovieDetails)
      })
    )

    renderWithQueryClient(<MovieDetailPage movieId="1" />)

    await waitFor(() => {
      expect(screen.getAllByText('Action')).toHaveLength(2) // Appears in meta and additional info sections
      expect(screen.getAllByText('Adventure')).toHaveLength(2) // Appears in meta and additional info sections
    })
  })

  it('renders production companies', async () => {
    server.use(
      http.get('https://api.themoviedb.org/3/movie/1', () => {
        return HttpResponse.json(mockMovieDetails)
      })
    )

    renderWithQueryClient(<MovieDetailPage movieId="1" />)

    await waitFor(() => {
      expect(screen.getByText('Production Companies')).toBeInTheDocument()
      expect(screen.getByText('Test Studios')).toBeInTheDocument()
      expect(screen.getByText('Another Studio')).toBeInTheDocument()
    })
  })

  it('handles movie without backdrop image', async () => {
    const movieWithoutBackdrop = {
      ...mockMovieDetails,
      backdrop_path: null,
    }

    server.use(
      http.get('https://api.themoviedb.org/3/movie/1', () => {
        return HttpResponse.json(movieWithoutBackdrop)
      })
    )

    renderWithQueryClient(<MovieDetailPage movieId="1" />)

    await waitFor(() => {
      expect(screen.getByText('No Image Available')).toBeInTheDocument()
    })
  })

  it('adds movie to wishlist when button is clicked', async () => {
    server.use(
      http.get('https://api.themoviedb.org/3/movie/1', () => {
        return HttpResponse.json(mockMovieDetails)
      })
    )

    renderWithQueryClient(<MovieDetailPage movieId="1" />)

    await waitFor(() => {
      expect(screen.getByText('Add to Wishlist')).toBeInTheDocument()
    })

    const wishlistButton = screen.getByText('Add to Wishlist')
    await user.click(wishlistButton)

    // Check if movie was added to wishlist
    const { useWishlistStore } = await import('../../stores/wishlistStore')
    expect(useWishlistStore.getState().isInWishlist(1)).toBe(true)
    
    // Button text should change
    await waitFor(() => {
      expect(screen.getByText('Remove from Wishlist')).toBeInTheDocument()
    })
  })

  it('removes movie from wishlist when button is clicked and movie is already in wishlist', async () => {
    server.use(
      http.get('https://api.themoviedb.org/3/movie/1', () => {
        return HttpResponse.json(mockMovieDetails)
      })
    )

    // Pre-add movie to wishlist
    const { useWishlistStore } = await import('../../stores/wishlistStore')
    useWishlistStore.getState().addMovie(1)

    renderWithQueryClient(<MovieDetailPage movieId="1" />)

    await waitFor(() => {
      expect(screen.getByText('Remove from Wishlist')).toBeInTheDocument()
    })

    const wishlistButton = screen.getByText('Remove from Wishlist')
    await user.click(wishlistButton)

    // Check if movie was removed from wishlist
    expect(useWishlistStore.getState().isInWishlist(1)).toBe(false)
    
    // Button text should change
    await waitFor(() => {
      expect(screen.getByText('Add to Wishlist')).toBeInTheDocument()
    })
  })

  it('applies correct CSS classes for wishlist button states', async () => {
    server.use(
      http.get('https://api.themoviedb.org/3/movie/1', () => {
        return HttpResponse.json(mockMovieDetails)
      })
    )

    renderWithQueryClient(<MovieDetailPage movieId="1" />)

    // Initially not in wishlist
    await waitFor(() => {
      const button = screen.getByText('Add to Wishlist')
      expect(button).toHaveClass('movie-detail__wishlist-btn')
      expect(button).not.toHaveClass('movie-detail__wishlist-btn--active')
    })

    // Add to wishlist
    await user.click(screen.getByText('Add to Wishlist'))

    // Should have active class
    await waitFor(() => {
      const button = screen.getByText('Remove from Wishlist')
      expect(button).toHaveClass('movie-detail__wishlist-btn')
      expect(button).toHaveClass('movie-detail__wishlist-btn--active')
    })
  })

  it('handles movies with empty production companies array', async () => {
    const movieWithoutCompanies = {
      ...mockMovieDetails,
      production_companies: [],
    }

    server.use(
      http.get('https://api.themoviedb.org/3/movie/1', () => {
        return HttpResponse.json(movieWithoutCompanies)
      })
    )

    renderWithQueryClient(<MovieDetailPage movieId="1" />)

    await waitFor(() => {
      expect(screen.getByText('Production Companies')).toBeInTheDocument()
    })

    // Should not crash and should still show the section title
    expect(screen.queryByText('Test Studios')).not.toBeInTheDocument()
  })

  it('renders movie with correct image URL', async () => {
    server.use(
      http.get('https://api.themoviedb.org/3/movie/1', () => {
        return HttpResponse.json(mockMovieDetails)
      })
    )

    renderWithQueryClient(<MovieDetailPage movieId="1" />)

    await waitFor(() => {
      const image = screen.getByAltText('Test Movie')
      expect(image).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w1280/test-backdrop.jpg')
    })
  })
})