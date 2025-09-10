import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import './__root.scss'

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="navigation">
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/wishlist" className="nav-link">
          Wishlist
        </Link>
      </div>
      <hr className="nav-divider" />
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
})
