import { describe, it, expect, beforeEach } from 'vitest'
import { useWishlistStore } from '../wishlistStore'

describe('WishlistStore', () => {
  beforeEach(() => {
    // Clear the store before each test
    useWishlistStore.getState().clearWishlist()
  })

  describe('Initial State', () => {
    it('should have empty movieIds array initially', () => {
      const state = useWishlistStore.getState()
      expect(state.movieIds).toEqual([])
    })
  })

  describe('addMovie', () => {
    it('should add a movie to the wishlist', () => {
      const { addMovie, isInWishlist } = useWishlistStore.getState()
      
      addMovie(1)
      
      const state = useWishlistStore.getState()
      expect(state.movieIds).toEqual([1])
      expect(isInWishlist(1)).toBe(true)
    })

    it('should add multiple movies to the wishlist', () => {
      const { addMovie, isInWishlist } = useWishlistStore.getState()
      
      addMovie(1)
      addMovie(2)
      addMovie(3)
      
      const state = useWishlistStore.getState()
      expect(state.movieIds).toEqual([1, 2, 3])
      expect(isInWishlist(1)).toBe(true)
      expect(isInWishlist(2)).toBe(true)
      expect(isInWishlist(3)).toBe(true)
    })

    it('should not add duplicate movies', () => {
      const { addMovie } = useWishlistStore.getState()
      
      addMovie(1)
      addMovie(1)
      addMovie(1)
      
      const state = useWishlistStore.getState()
      expect(state.movieIds).toEqual([1])
      expect(state.movieIds.length).toBe(1)
    })

    it('should handle edge case of adding movie with ID 0', () => {
      const { addMovie, isInWishlist } = useWishlistStore.getState()
      
      addMovie(0)
      
      const state = useWishlistStore.getState()
      expect(state.movieIds).toEqual([0])
      expect(isInWishlist(0)).toBe(true)
    })

    it('should handle negative movie IDs', () => {
      const { addMovie, isInWishlist } = useWishlistStore.getState()
      
      addMovie(-1)
      
      const state = useWishlistStore.getState()
      expect(state.movieIds).toEqual([-1])
      expect(isInWishlist(-1)).toBe(true)
    })
  })

  describe('removeMovie', () => {
    it('should remove a movie from the wishlist', () => {
      const { addMovie, removeMovie, isInWishlist } = useWishlistStore.getState()
      
      addMovie(1)
      addMovie(2)
      expect(useWishlistStore.getState().movieIds).toEqual([1, 2])
      
      removeMovie(1)
      
      const state = useWishlistStore.getState()
      expect(state.movieIds).toEqual([2])
      expect(isInWishlist(1)).toBe(false)
      expect(isInWishlist(2)).toBe(true)
    })

    it('should handle removing non-existent movie gracefully', () => {
      const { addMovie, removeMovie } = useWishlistStore.getState()
      
      addMovie(1)
      expect(useWishlistStore.getState().movieIds).toEqual([1])
      
      removeMovie(999) // Movie not in wishlist
      
      const state = useWishlistStore.getState()
      expect(state.movieIds).toEqual([1]) // Should remain unchanged
    })

    it('should handle removing from empty wishlist gracefully', () => {
      const { removeMovie } = useWishlistStore.getState()
      
      expect(useWishlistStore.getState().movieIds).toEqual([])
      
      removeMovie(1)
      
      const state = useWishlistStore.getState()
      expect(state.movieIds).toEqual([]) // Should remain empty
    })

    it('should remove all instances if somehow duplicates exist', () => {
      const { removeMovie } = useWishlistStore.getState()
      
      // Manually set state with duplicates (shouldn't happen in normal use)
      useWishlistStore.setState({ movieIds: [1, 2, 1, 3, 1] })
      
      removeMovie(1)
      
      const state = useWishlistStore.getState()
      expect(state.movieIds).toEqual([2, 3])
    })
  })

  describe('isInWishlist', () => {
    it('should return true for movies in wishlist', () => {
      const { addMovie, isInWishlist } = useWishlistStore.getState()
      
      addMovie(1)
      addMovie(2)
      
      expect(isInWishlist(1)).toBe(true)
      expect(isInWishlist(2)).toBe(true)
    })

    it('should return false for movies not in wishlist', () => {
      const { addMovie, isInWishlist } = useWishlistStore.getState()
      
      addMovie(1)
      
      expect(isInWishlist(2)).toBe(false)
      expect(isInWishlist(999)).toBe(false)
    })

    it('should return false for empty wishlist', () => {
      const { isInWishlist } = useWishlistStore.getState()
      
      expect(isInWishlist(1)).toBe(false)
    })

    it('should handle edge cases correctly', () => {
      const { addMovie, isInWishlist } = useWishlistStore.getState()
      
      addMovie(0)
      addMovie(-1)
      
      expect(isInWishlist(0)).toBe(true)
      expect(isInWishlist(-1)).toBe(true)
      expect(isInWishlist(1)).toBe(false)
    })
  })

  describe('clearWishlist', () => {
    it('should clear all movies from wishlist', () => {
      const { addMovie, clearWishlist, isInWishlist } = useWishlistStore.getState()
      
      addMovie(1)
      addMovie(2)
      addMovie(3)
      expect(useWishlistStore.getState().movieIds).toEqual([1, 2, 3])
      
      clearWishlist()
      
      const state = useWishlistStore.getState()
      expect(state.movieIds).toEqual([])
      expect(isInWishlist(1)).toBe(false)
      expect(isInWishlist(2)).toBe(false)
      expect(isInWishlist(3)).toBe(false)
    })

    it('should handle clearing empty wishlist gracefully', () => {
      const { clearWishlist } = useWishlistStore.getState()
      
      expect(useWishlistStore.getState().movieIds).toEqual([])
      
      clearWishlist()
      
      const state = useWishlistStore.getState()
      expect(state.movieIds).toEqual([])
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle multiple operations in sequence', () => {
      const { addMovie, removeMovie, clearWishlist, isInWishlist } = useWishlistStore.getState()
      
      // Add movies
      addMovie(1)
      addMovie(2)
      addMovie(3)
      expect(useWishlistStore.getState().movieIds).toEqual([1, 2, 3])
      
      // Check wishlist status
      expect(isInWishlist(1)).toBe(true)
      expect(isInWishlist(4)).toBe(false)
      
      // Remove a movie
      removeMovie(2)
      expect(useWishlistStore.getState().movieIds).toEqual([1, 3])
      expect(isInWishlist(2)).toBe(false)
      
      // Add more movies
      addMovie(4)
      addMovie(5)
      expect(useWishlistStore.getState().movieIds).toEqual([1, 3, 4, 5])
      
      // Clear all
      clearWishlist()
      expect(useWishlistStore.getState().movieIds).toEqual([])
      expect(isInWishlist(1)).toBe(false)
    })

    it('should maintain correct order when adding movies', () => {
      const { addMovie } = useWishlistStore.getState()
      
      const movieIds = [5, 1, 3, 2, 4]
      movieIds.forEach(id => addMovie(id))
      
      const state = useWishlistStore.getState()
      expect(state.movieIds).toEqual([5, 1, 3, 2, 4])
    })
  })
})