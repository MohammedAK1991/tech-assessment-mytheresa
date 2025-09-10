import type { MovieDetails, MoviesResponse, MovieCategory } from '../types/movie';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

class MovieApiService {
  private async fetchFromAPI<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Movie API fetch error:', error);
      throw error;
    }
  }

  async getMoviesByCategory(category: MovieCategory, page: number = 1): Promise<MoviesResponse> {
    return this.fetchFromAPI<MoviesResponse>(`/movie/${category}?page=${page}`);
  }

  async getMovieDetails(movieId: number): Promise<MovieDetails> {
    return this.fetchFromAPI<MovieDetails>(`/movie/${movieId}`);
  }

  getImageUrl(path: string | null, size: string = 'w500'): string | null {
    if (!path) return null;
    return `${IMAGE_BASE_URL}/${size}${path}`;
  }

  getPosterUrl(posterPath: string | null): string | null {
    return this.getImageUrl(posterPath, 'w500');
  }

  getBackdropUrl(backdropPath: string | null): string | null {
    return this.getImageUrl(backdropPath, 'w1280');
  }
}

export const movieApi = new MovieApiService();