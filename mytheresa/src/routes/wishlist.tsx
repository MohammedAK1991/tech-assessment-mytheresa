import { createFileRoute, Link } from '@tanstack/react-router'
import { useWishlistStore } from '../stores/wishlistStore'
import { useMovieDetails } from '../hooks/useMovies'
import { movieApi } from '../services/movieApi'
import './wishlist.scss'

export const Route = createFileRoute('/wishlist')({
  component: WishlistPage,
})

function WishlistPage() {
  const { movieIds, removeMovie } = useWishlistStore()
  
  if (movieIds.length === 0) {
    return (
      <div className="wishlist">
        <h1 className="wishlist__title">My Wishlist</h1>
        <p className="wishlist__subtitle">Movies you've added to your wishlist will appear here.</p>
        
        <div className="wishlist__content">
          <div className="wishlist__placeholder">
            No movies in wishlist yet
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="wishlist">
      <h1 className="wishlist__title">My Wishlist</h1>
      <p className="wishlist__subtitle">Movies you've added to your wishlist will appear here.</p>
      
      <div className="wishlist__content">
        <div className="wishlist__grid">
          {movieIds.map((movieId) => (
            <WishlistMovieCard key={movieId} movieId={movieId} onRemove={() => removeMovie(movieId)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function WishlistMovieCard({ movieId, onRemove }: { movieId: number; onRemove: () => void }) {
  const { data: movie, isLoading, isError } = useMovieDetails(movieId)
  
  if (isLoading) {
    return (
      <div className="wishlist-card wishlist-card--loading">
        <div className="wishlist-card__placeholder">Loading...</div>
      </div>
    )
  }
  
  if (isError || !movie) {
    return (
      <div className="wishlist-card wishlist-card--error">
        <div className="wishlist-card__placeholder">Failed to load movie</div>
        <button onClick={onRemove} className="wishlist-card__remove-btn">Remove</button>
      </div>
    )
  }
  
  return (
    <div className="wishlist-card">
      <Link 
        to="/movie/$movieId" 
        params={{ movieId: movieId.toString() }}
        className="wishlist-card__link"
      >
        <div className="wishlist-card__poster">
          {movie.poster_path ? (
            <img
              src={movieApi.getPosterUrl(movie.poster_path) || ''}
              alt={movie.title}
              className="wishlist-card__image"
            />
          ) : (
            <div className="wishlist-card__no-image">No Image</div>
          )}
        </div>
        
        <div className="wishlist-card__info">
          <h3 className="wishlist-card__title">{movie.title}</h3>
          <p className="wishlist-card__year">
            {new Date(movie.release_date).getFullYear()}
          </p>
          <p className="wishlist-card__rating">
            ⭐ {movie.vote_average.toFixed(1)}/10
          </p>
        </div>
      </Link>
      
      <button 
        onClick={onRemove} 
        className="wishlist-card__remove-btn"
        title="Remove from wishlist"
      >
        ×
      </button>
    </div>
  )
}