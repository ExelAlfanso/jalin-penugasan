import { createError } from 'h3'

export async function tmdb<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const key = useRuntimeConfig().tmdbApiKey
  if (!key) throw createError({ statusCode: 503, statusMessage: 'TMDB key is not configured.' })
  try {
    return await $fetch<T>(`https://api.themoviedb.org/3${path}` as string, {
      query: { ...params, api_key: key, language: 'en-US' },
    }) as T
  } catch (error: any) {
    if (error?.statusCode === 404 || error?.status === 404) {
      throw createError({ statusCode: 404, statusMessage: 'Movie not found.' })
    }
    throw createError({ statusCode: 502, statusMessage: 'TMDB is unavailable. Please try again.' })
  }
}
