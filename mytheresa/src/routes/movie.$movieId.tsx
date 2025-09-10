import { createFileRoute } from '@tanstack/react-router'
import { useMovieDetails } from '../hooks/useMovies'
import { movieApi } from '../services/movieApi'
import { useWishlistStore } from '../stores/wishlistStore'
import './movie-detail.scss'

export const Route = createFileRoute('/movie/$movieId')({
  component: MovieDetailPage,
})

function MovieDetailPage() {
  const { movieId } = Route.useParams()
  const movieIdNumber = parseInt(movieId)
  
  const { data: movie, isLoading, isError } = useMovieDetails(movieIdNumber)
  const { addMovie, removeMovie, isInWishlist } = useWishlistStore()
  
  const isInWishlistState = isInWishlist(movieIdNumber)
  
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
    <div className="movie-detail">
      <h1 className="movie-detail__title">{movie.title}</h1>
      
      <div className="movie-detail__content">
        {/* Image Area - Left Column */}
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
        
        {/* Right Column - Button/Description + Additional Info */}
        <div className="movie-detail__right-column">
          {/* Button and Description Area */}
          <div className="movie-detail__button-description">
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
            
            <button 
              className={`movie-detail__wishlist-btn ${isInWishlistState ? 'movie-detail__wishlist-btn--active' : ''}`}
              onClick={handleWishlistToggle}
            >
              {isInWishlistState ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
          
          {/* Additional Info Area */}
          <div className="movie-detail__additional">
            <h3 className="movie-detail__additional-title">Production Companies</h3>
            <div className="movie-detail__companies">
              {movie.production_companies.map((company) => (
                <span key={company.id} className="movie-detail__company">
                  {company.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}