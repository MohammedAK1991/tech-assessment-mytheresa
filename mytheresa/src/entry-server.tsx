import ReactDOMServer from 'react-dom/server'

export async function render(url: string) {
  // For now, return a simple HTML structure for SSR
  // TanStack Router SSR requires more complex setup that we'll implement later
  const html = ReactDOMServer.renderToString(
    <div id="ssr-fallback">
      <h1>Loading...</h1>
      <p>Server-side rendering is being initialized.</p>
    </div>
  )

  return { html }
}