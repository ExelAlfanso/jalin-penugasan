export interface Movie {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  vote_average: number
  overview: string
}

export interface MoviePage {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

export interface Genre { id: number; name: string }

export interface MovieDetail extends Movie {
  backdrop_path: string | null
  runtime: number | null
  genres: Genre[]
  credits: { cast: { id: number; name: string; character: string; profile_path: string | null }[] }
  trailer: string | null
}
