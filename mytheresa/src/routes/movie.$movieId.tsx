import { createFileRoute } from '@tanstack/react-router'
import { useMovieDetails, useHomepageMovies } from '../hooks/useMovies'
import { movieApi } from '../services/movieApi'
import { useWishlistStore } from '../stores/wishlistStore'
import type { MovieCategory } from '../types/movie'
import './movie-detail.scss'

function MovieDetailPage({ movieId }: { movieId?: string } = {}) {
  let actualMovieId = movieId
  if (!actualMovieId) {
    try {
      if (typeof Route !== 'undefined' && Route?.useParams) {
        const routeParams = Route.useParams()
        actualMovieId = routeParams.movieId
      }
    } catch (e) {
      console.warn('Route params not available, using default movieId for testing')
    }
  }
  const movieIdNumber = parseInt(actualMovieId || '1')
  
  const { data: movie, isLoading, isError } = useMovieDetails(movieIdNumber)
  const { popular, nowPlaying, topRated } = useHomepageMovies()
  const { addMovie, removeMovie, isInWishlist } = useWishlistStore()
  
  const isInWishlistState = isInWishlist(movieIdNumber)
  
  // Determine which category this movie belongs to
  const getMovieCategory = (): MovieCategory => {
    if (popular?.data?.results?.some((m: any) => m.id === movieIdNumber)) return 'popular'
    if (nowPlaying?.data?.results?.some((m: any) => m.id === movieIdNumber)) return 'now_playing'
    if (topRated?.data?.results?.some((m: any) => m.id === movieIdNumber)) return 'top_rated'
    return 'popular' // default fallback
  }
  
  const movieCategory = getMovieCategory()
  
  const handleWishlistToggle = () => {
    if (isInWishlistState) {
      removeMovie(movieIdNumber)
    } else {
      addMovie(movieIdNumber)
    }
  }

  if (isLoading) {
    return (
      <div className="movie-detail">
        <div className="loading-placeholder">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (isError || !movie) {
    return (
      <div className="movie-detail">
        <h1 className="movie-detail__title">Movie Not Found</h1>
        <p>Sorry, we couldn't find the movie you're looking for.</p>
      </div>
    )
  }

  return (
    <div className={`movie-detail movie-detail--${movieCategory}`}>
      {/* Header Area */}
      <header className="movie-detail__header">
        <h1 className="movie-detail__title">{movie.title}</h1>
      </header>
      
      <div className="movie-detail__content">
        {/* Image Area - Left Column */}
        <div className="movie-detail__image-area">
          <div className="movie-detail__image">
            {movie.backdrop_path ? (
              <img
                src={movieApi.getBackdropUrl(movie.backdrop_path) || ''}
                alt={movie.title}
                className="movie-detail__backdrop"
              />
            ) : (
              <div className="movie-detail__no-image">No Image Available</div>
            )}
          </div>
        </div>
        
        {/* Right Column - Button and Description Area */}
        <div className="movie-detail__info-area">
          <div className="movie-detail__button-description">
            <div className="movie-detail__content-top">
              <div className="movie-detail__meta">
                <span className="movie-detail__year">
                  {new Date(movie.release_date).getFullYear()}
                </span>
                <span className="movie-detail__rating">
                  ⭐ {movie.vote_average.toFixed(1)}/10
                </span>
                <span className="movie-detail__runtime">
                  {movie.runtime} min
                </span>
              </div>
              
              <div className="movie-detail__genres">
                {movie.genres.map((genre) => (
                  <span key={genre.id} className="movie-detail__genre">
                    {genre.name}
                  </span>
                ))}
              </div>
              
              <p className="movie-detail__description">
                {movie.overview}
              </p>
            </div>
            
            <div className="movie-detail__content-bottom">
              <button 
                className={`movie-detail__wishlist-btn movie-detail__wishlist-btn--${movieCategory} ${isInWishlistState ? 'movie-detail__wishlist-btn--active' : ''}`}
                onClick={handleWishlistToggle}
              >
                {isInWishlistState ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Info Area - Full Width */}
      <div className="movie-detail__additional-info">
        <div className="movie-detail__additional">
          <div className="movie-detail__info-grid">
            <div className="movie-detail__info-section">
              <h3 className="movie-detail__additional-title">Production Companies</h3>
              <div className="movie-detail__companies">
                {movie.production_companies.length > 0 ? (
                  movie.production_companies.map((company) => (
                    <span key={company.id} className="movie-detail__company">
                      {company.name}
                    </span>
                  ))
                ) : (
                  <span className="movie-detail__no-info">No production companies available</span>
                )}
              </div>
            </div>
            
            <div className="movie-detail__info-section">
              <h3 className="movie-detail__additional-title">Movie Details</h3>
              <div className="movie-detail__release-info">
                <div className="movie-detail__info-item">
                  <strong>Release Date:</strong> {new Date(movie.release_date).toLocaleDateString()}
                </div>
                <div className="movie-detail__info-item">
                  <strong>Runtime:</strong> {movie.runtime} minutes
                </div>
                <div className="movie-detail__info-item">
                  <strong>Rating:</strong> ⭐ {movie.vote_average.toFixed(1)}/10
                </div>
                <div className="movie-detail__info-item">
                  <strong>Movie ID:</strong> #{movie.id}
                </div>
              </div>
            </div>
            
            <div className="movie-detail__info-section">
              <h3 className="movie-detail__additional-title">Genres</h3>
              <div className="movie-detail__languages-countries">
                <div className="movie-detail__genres-list">
                  {movie.genres.map((genre) => (
                    <span key={genre.id} className="movie-detail__genre-tag">
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/movie/$movieId')({
  component: MovieDetailPage,
})

// Export MovieDetailPage for testing
export { MovieDetailPage }