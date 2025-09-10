import { createFileRoute } from '@tanstack/react-router'
import './wishlist.scss'

export const Route = createFileRoute('/wishlist')({
  component: WishlistPage,
})

function WishlistPage() {
  return (
    <div className="wishlist">
      <h1 className="wishlist__title">My Wishlist</h1>
      <p className="wishlist__subtitle">Movies you've added to your wishlist will appear here.</p>
      
      {/* Placeholder for wishlist items */}
      <div className="wishlist__content">
        <div className="wishlist__placeholder">
          No movies in wishlist yet
        </div>
      </div>
    </div>
  )
}