import { useQuery } from '@tanstack/react-query'
import { movieApi } from '../services/movieApi'
import type { MovieCategory } from '../types/movie'

export function useMoviesByCategory(category: MovieCategory, page: number = 1) {
  return useQuery({
    queryKey: ['movies', category, page],
    queryFn: () => movieApi.getMoviesByCategory(category, page),
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
  })
}

export function useMovieDetails(movieId: number) {
  return useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => movieApi.getMovieDetails(movieId),
    enabled: !!movieId, // Only run if movieId exists
    staleTime: 10 * 60 * 1000, // Movie details don't change often
  })
}

// Custom hook for homepage that fetches all categories
export function useHomepageMovies() {
  const popularQuery = useMoviesByCategory('popular')
  const nowPlayingQuery = useMoviesByCategory('now_playing')
  const topRatedQuery = useMoviesByCategory('top_rated')

  return {
    popular: popularQuery,
    nowPlaying: nowPlayingQuery,
    topRated: topRatedQuery,
    isLoading: popularQuery.isPending || nowPlayingQuery.isPending || topRatedQuery.isPending,
    hasError: popularQuery.isError || nowPlayingQuery.isError || topRatedQuery.isError,
  }
}