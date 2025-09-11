import { RouterProvider } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { router as defaultRouter } from './router'

const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
})

interface AppProps {
  router?: any
  queryClient?: QueryClient
}

export function App({ router = defaultRouter, queryClient = defaultQueryClient }: AppProps = {}) {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {typeof window !== 'undefined' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

export default App
