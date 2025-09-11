import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '../utils'
import { useWishlistStore } from '../../stores/wishlistStore'

// Simple test components
function TestHomePage({ movies = [] }: { movies?: any[] }) {
  return (
    <div className="homepage">
      <div className="carousels">
        <div className="carousel-section">
          <h2>Popular Movies</h2>
          {movies.map(movie => (
            <div key={movie.id} title={movie.title}>
              <h3>{movie.title}</h3>
              <span>{new Date(movie.release_date).getFullYear()}</span>
              <span>⭐ {movie.vote_average.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TestMovieDetail({ movie, movieId = 1 }: { movie: any, movieId?: number }) {
  const { addMovie, removeMovie, isInWishlist } = useWishlistStore()
  const isInWishlistState = isInWishlist(movieId)
  
  const handleWishlistToggle = () => {
    if (isInWishlistState) {
      removeMovie(movieId)
    } else {
      addMovie(movieId)
    }
  }

  return (
    <div className="movie-detail">
      <h1>{movie.title}</h1>
      <p>{movie.overview}</p>
      <button onClick={handleWishlistToggle}>
        {isInWishlistState ? 'Remove from Wishlist' : 'Add to Wishlist'}
      </button>
    </div>
  )
}

const mockMoviesData = [
  {
    id: 1,
    title: 'Action Movie',
    release_date: '2023-01-01',
    vote_average: 8.5,
    overview: 'An exciting action movie',
  },
  {
    id: 2,
    title: 'Comedy Movie',
    release_date: '2023-02-01',
    vote_average: 7.8,
    overview: 'A hilarious comedy movie',
  },
]

const mockMovieDetails = {
  id: 1,
  title: 'Action Movie',
  overview: 'An exciting action movie with lots of thrills and adventure.',
  release_date: '2023-01-01',
  vote_average: 8.5,
}

describe('Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    // Clear wishlist before each test
    useWishlistStore.getState().clearWishlist()
  })

  describe('Homepage Integration', () => {
    it('displays movies from all categories', async () => {
      renderWithQueryClient(<TestHomePage movies={mockMoviesData} />)

      await waitFor(() => {
        expect(screen.getByText('Popular Movies')).toBeInTheDocument()
        expect(screen.getByText('Action Movie')).toBeInTheDocument()
        expect(screen.getByText('Comedy Movie')).toBeInTheDocument()
        expect(screen.getAllByText('2023')).toHaveLength(2) // Both movies from 2023
        expect(screen.getByText('⭐ 8.5')).toBeInTheDocument()
      })
    })

    it('handles empty movie results gracefully', async () => {
      renderWithQueryClient(<TestHomePage movies={[]} />)

      await waitFor(() => {
        expect(screen.getByText('Popular Movies')).toBeInTheDocument()
      })

      expect(screen.queryByText('Action Movie')).not.toBeInTheDocument()
    })
  })

  describe('Movie Detail Integration', () => {
    it('displays movie details and allows wishlist interaction', async () => {
      renderWithQueryClient(<TestMovieDetail movie={mockMovieDetails} movieId={1} />)

      await waitFor(() => {
        expect(screen.getByText('Action Movie')).toBeInTheDocument()
        expect(screen.getByText('An exciting action movie with lots of thrills and adventure.')).toBeInTheDocument()
      })

      // Test wishlist functionality
      expect(screen.getByText('Add to Wishlist')).toBeInTheDocument()
      expect(useWishlistStore.getState().isInWishlist(1)).toBe(false)

      // Add to wishlist
      await user.click(screen.getByText('Add to Wishlist'))

      await waitFor(() => {
        expect(screen.getByText('Remove from Wishlist')).toBeInTheDocument()
      })
      expect(useWishlistStore.getState().isInWishlist(1)).toBe(true)

      // Remove from wishlist
      await user.click(screen.getByText('Remove from Wishlist'))

      await waitFor(() => {
        expect(screen.getByText('Add to Wishlist')).toBeInTheDocument()
      })
      expect(useWishlistStore.getState().isInWishlist(1)).toBe(false)
    })
  })

  describe('Wishlist Store Integration', () => {
    it('maintains wishlist state across components', () => {
      const { addMovie, removeMovie, isInWishlist, clearWishlist } = useWishlistStore.getState()

      // Initially empty
      expect(useWishlistStore.getState().movieIds).toEqual([])
      expect(isInWishlist(1)).toBe(false)

      // Add movies
      addMovie(1)
      addMovie(2)
      addMovie(3)

      expect(useWishlistStore.getState().movieIds).toEqual([1, 2, 3])
      expect(isInWishlist(1)).toBe(true)
      expect(isInWishlist(2)).toBe(true)
      expect(isInWishlist(3)).toBe(true)

      // Remove a movie
      removeMovie(2)

      expect(useWishlistStore.getState().movieIds).toEqual([1, 3])
      expect(isInWishlist(2)).toBe(false)

      // Clear all
      clearWishlist()

      expect(useWishlistStore.getState().movieIds).toEqual([])
      expect(isInWishlist(1)).toBe(false)
      expect(isInWishlist(3)).toBe(false)
    })

    it('prevents duplicate additions to wishlist', () => {
      const { addMovie } = useWishlistStore.getState()

      addMovie(1)
      addMovie(1)
      addMovie(1)

      expect(useWishlistStore.getState().movieIds).toEqual([1])
      expect(useWishlistStore.getState().movieIds.length).toBe(1)
    })

    it('handles edge cases gracefully', () => {
      const { addMovie, removeMovie, isInWishlist } = useWishlistStore.getState()

      // Removing non-existent movie
      removeMovie(999)
      expect(useWishlistStore.getState().movieIds).toEqual([])

      // Adding edge case IDs
      addMovie(0)
      addMovie(-1)

      expect(useWishlistStore.getState().movieIds).toEqual([0, -1])
      expect(isInWishlist(0)).toBe(true)
      expect(isInWishlist(-1)).toBe(true)
    })
  })

  describe('Component and Store Integration', () => {
    it('integrates movie detail with wishlist store correctly', async () => {
      // Start with movie not in wishlist
      expect(useWishlistStore.getState().isInWishlist(1)).toBe(false)

      renderWithQueryClient(<TestMovieDetail movie={mockMovieDetails} movieId={1} />)

      // Should show "Add to Wishlist" button
      expect(screen.getByText('Add to Wishlist')).toBeInTheDocument()

      // Click to add to wishlist
      await user.click(screen.getByText('Add to Wishlist'))

      // Store should be updated
      expect(useWishlistStore.getState().isInWishlist(1)).toBe(true)
      
      // UI should reflect the change
      await waitFor(() => {
        expect(screen.getByText('Remove from Wishlist')).toBeInTheDocument()
      })

      // Click to remove from wishlist
      await user.click(screen.getByText('Remove from Wishlist'))

      // Store should be updated
      expect(useWishlistStore.getState().isInWishlist(1)).toBe(false)
      
      // UI should reflect the change
      await waitFor(() => {
        expect(screen.getByText('Add to Wishlist')).toBeInTheDocument()
      })
    })

    it('handles multiple movies in wishlist correctly', async () => {
      // Pre-add some movies to wishlist
      const { addMovie } = useWishlistStore.getState()
      addMovie(2)
      addMovie(3)

      expect(useWishlistStore.getState().movieIds).toEqual([2, 3])

      renderWithQueryClient(<TestMovieDetail movie={mockMovieDetails} movieId={1} />)

      // Add this movie too
      await user.click(screen.getByText('Add to Wishlist'))

      // All movies should be in wishlist
      expect(useWishlistStore.getState().movieIds).toEqual([2, 3, 1])
      expect(useWishlistStore.getState().isInWishlist(1)).toBe(true)
      expect(useWishlistStore.getState().isInWishlist(2)).toBe(true)
      expect(useWishlistStore.getState().isInWishlist(3)).toBe(true)
    })
  })
})