import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
  movieIds: number[]
  addMovie: (movieId: number) => void
  removeMovie: (movieId: number) => void
  isInWishlist: (movieId: number) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      movieIds: [],
      
      addMovie: (movieId: number) => {
        set((state) => ({
          movieIds: state.movieIds.includes(movieId) 
            ? state.movieIds 
            : [...state.movieIds, movieId]
        }))
      },
      
      removeMovie: (movieId: number) => {
        set((state) => ({
          movieIds: state.movieIds.filter(id => id !== movieId)
        }))
      },
      
      isInWishlist: (movieId: number) => {
        return get().movieIds.includes(movieId)
      },
      
      clearWishlist: () => {
        set({ movieIds: [] })
      }
    }),
    {
      name: 'wishlist-storage', 
    }
  )
)
