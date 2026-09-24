import { describe, expect, it } from 'vitest'
import { isMovieId, movieRequest, selectTrailer } from '../server/utils/movie'
import { catalogueQuery } from '../app/utils/catalogue'

describe('movie API decisions', () => {
  it('chooses popular, genre, and search modes with bounded pages', () => {
    expect(movieRequest({})).toEqual({ path: '/movie/popular', params: { page: 1 } })
    expect(movieRequest({ genre: '28', page: '2' })).toEqual({ path: '/discover/movie', params: { with_genres: '28', page: 2, sort_by: 'popularity.desc' } })
    expect(movieRequest({ q: '  Alien  ', genre: '28', page: '-1' })).toEqual({ path: '/search/movie', params: { query: 'Alien', page: 1 } })
    expect(movieRequest({ page: '999' }).params.page).toBe(500)
  })

  it('keeps only the active mode when changing filters or pages', () => {
    const current = { q: 'Alien', genre: 28 }
    expect(catalogueQuery('genre', 12, current)).toEqual({ genre: '12' })
    expect(catalogueQuery('search', 'Dune', current)).toEqual({ q: 'Dune' })
    expect(catalogueQuery('page', 3, current)).toEqual({ q: 'Alien', page: '3' })
    expect(catalogueQuery('page', 2, { q: '', genre: 28 })).toEqual({ genre: '28', page: '2' })
  })

  it('rejects invalid detail IDs', () => {
    expect(isMovieId('0')).toBe(false)
    expect(isMovieId('abc')).toBe(false)
    expect(isMovieId('12/credits')).toBe(false)
    expect(isMovieId('123')).toBe(true)
  })

  it('chooses an official YouTube trailer, then a regular trailer', () => {
    const regular = { key: 'abcdefghijk', site: 'YouTube', type: 'Trailer', official: false }
    const official = { key: '12345678901', site: 'YouTube', type: 'Trailer', official: true }
    expect(selectTrailer([regular, official])).toBe(official.key)
    expect(selectTrailer([regular])).toBe(regular.key)
    expect(selectTrailer([{ ...official, site: 'Vimeo' }])).toBeNull()
    expect(selectTrailer([{ ...official, key: 'unsafe?key' }])).toBeNull()
  })
})
