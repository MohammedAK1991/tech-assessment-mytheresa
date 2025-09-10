import { http, HttpResponse } from 'msw'
import type { MoviesResponse, MovieDetails } from '../../types/movie'

const BASE_URL = 'https://api.themoviedb.org/3'

// Mock movie data
const mockMovie = {
  id: 1,
  title: 'Test Movie',
  overview: 'A test movie for testing purposes',
  poster_path: '/test-poster.jpg',
  backdrop_path: '/test-backdrop.jpg',
  release_date: '2023-01-01',
  vote_average: 8.5,
  runtime: 120,
  genre_ids: [1, 2],
  genres: [
    { id: 1, name: 'Action' },
    { id: 2, name: 'Adventure' }
  ],
  production_companies: [
    { id: 1, name: 'Test Studios', logo_path: null, origin_country: 'US' }
  ]
}

const mockMoviesResponse: MoviesResponse = {
  page: 1,
  results: [
    mockMovie,
    {
      id: 2,
      title: 'Another Test Movie',
      overview: 'Another test movie',
      poster_path: '/test-poster-2.jpg',
      backdrop_path: '/test-backdrop-2.jpg',
      release_date: '2023-02-01',
      vote_average: 7.8,
      genre_ids: [3, 4],
    },
  ],
  total_pages: 1,
  total_results: 2,
}

export const handlers = [
  // Get movies by category
  http.get(`${BASE_URL}/movie/popular`, () => {
    return HttpResponse.json(mockMoviesResponse)
  }),

  http.get(`${BASE_URL}/movie/now_playing`, () => {
    return HttpResponse.json(mockMoviesResponse)
  }),

  http.get(`${BASE_URL}/movie/top_rated`, () => {
    return HttpResponse.json(mockMoviesResponse)
  }),

  // Get movie details
  http.get(`${BASE_URL}/movie/:movieId`, ({ params }) => {
    const movieId = parseInt(params.movieId as string)
    
    if (movieId === 1) {
      return HttpResponse.json(mockMovie as MovieDetails)
    }
    
    if (movieId === 999) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json({
      ...mockMovie,
      id: movieId,
      title: `Movie ${movieId}`,
    } as MovieDetails)
  }),

  // Error case for testing
  http.get(`${BASE_URL}/movie/error`, () => {
    return new HttpResponse(null, { status: 500 })
  }),
]