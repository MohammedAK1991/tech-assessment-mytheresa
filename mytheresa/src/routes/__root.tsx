import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import './__root.scss'

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="navigation">
        <div className="navigation__brand">
          <Link to="/" className="nav-brand">
            LuxExperience Movie App
          </Link>
        </div>
        <div className="navigation__links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/wishlist" className="nav-link">
            Wishlist
          </Link>
        </div>
      </div>
      <hr className="nav-divider" />
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
})
