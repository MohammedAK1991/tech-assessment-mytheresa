import { createFileRoute, Link } from '@tanstack/react-router'
import { useHomepageMovies } from '../hooks/useMovies'
import { movieApi } from '../services/movieApi'
import type { Movie } from '../types/movie'
import './index.scss'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { popular, nowPlaying, topRated, isLoading, hasError } = useHomepageMovies()

  if (isLoading) {
    return (
      <div className="homepage">
        <div className="loading-placeholder">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="homepage">
        <p className="homepage__error">Error loading movies. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="homepage">
      <div className="carousels">
        <MovieCarousel 
          title="Popular Movies" 
          movies={popular.data?.results || []} 
        />
        
        <MovieCarousel 
          title="Now Playing" 
          movies={nowPlaying.data?.results || []} 
        />
        
        <MovieCarousel 
          title="Top Rated" 
          movies={topRated.data?.results || []} 
        />
      </div>
    </div>
  )
}

function MovieCarousel({ title, movies }: { title: string; movies: Movie[] }) {
  return (
    <div className="carousel-section">
      <h2 className="carousel-section__title">{title}</h2>
      <div className="movie-carousel">
        {movies.slice(0, 20).map((movie) => (
          <Link
            key={movie.id}
            to="/movie/$movieId"
            params={{ movieId: movie.id.toString() }}
            className="movie-card"
            title={movie.title}
          >
            <div className="movie-card__poster">
              {movie.poster_path ? (
                <img
                  src={movieApi.getPosterUrl(movie.poster_path) || ''}
                  alt={movie.title}
                  className="movie-card__image"
                />
              ) : (
                <div className="movie-card__no-image">No Image</div>
              )}
            </div>
            
            <div className="movie-card__hover-overlay">
              <div className="movie-card__hover-content">
                <h3 className="movie-card__hover-title">{movie.title}</h3>
                <div className="movie-card__hover-meta">
                  <span className="movie-card__hover-year">
                    {new Date(movie.release_date).getFullYear()}
                  </span>
                  <span className="movie-card__hover-rating">
                    ⭐ {movie.vote_average.toFixed(1)}
                  </span>
                </div>
              </div>

            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}