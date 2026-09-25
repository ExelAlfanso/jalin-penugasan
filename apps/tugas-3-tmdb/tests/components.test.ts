// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MovieFilters from '../app/components/movie/MovieFilters.vue'
import MovieInformation from '../app/components/movie/MovieInformation.vue'
import MovieCard from '../app/components/movie/MovieCard.vue'

describe('catalogue controls', () => {
  it('emits a trimmed search and selected genre', async () => {
    const wrapper = mount(MovieFilters, {
      props: { query: '', genre: null, genres: [{ id: 28, name: 'Action' }] },
      global: { stubs: {
        InputText: { template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />', props: ['modelValue'] },
        Button: { template: '<button type="submit">Search</button>' },
        Select: { template: '<button type="button" @click="$emit(\'update:modelValue\', 28)">Action</button>' },
      } },
    })
    await wrapper.find('input').setValue('  Alien  ')
    await wrapper.find('form').trigger('submit')
    await wrapper.findAll('button')[1]!.trigger('click')
    expect(wrapper.emitted('search')?.[0]).toEqual(['Alien'])
    expect(wrapper.emitted('genre')?.[0]).toEqual([28])
  })
})

describe('film detail', () => {
  it('shows fallbacks when poster, overview, and cast are missing', () => {
    const wrapper = mount(MovieInformation, {
      props: { movie: { id: 1, title: 'Untitled', poster_path: null, backdrop_path: null, release_date: '', vote_average: 0, overview: '', runtime: null, genres: [], credits: { cast: [] }, trailer: null } },
      global: { stubs: { Button: { template: '<button>Watch Trailer</button>' } } },
    })
    expect(wrapper.text()).toContain('Poster unavailable')
    expect(wrapper.text()).toContain('No synopsis is available')
    expect(wrapper.text()).toContain('Cast information is unavailable')
  })
})

it('offers a watchlist action separate from the movie link', async () => {
  const wrapper = mount(MovieCard, {
    props: { movie: { id: 7, title: 'A Film', poster_path: null, release_date: '2024-01-01', vote_average: 8 }, saved: false },
    global: { stubs: {
      NuxtLink: { template: '<a :href="to"><slot /></a>', props: ['to'] },
      Button: { template: '<button :aria-label="$attrs[\'aria-label\']" :aria-pressed="$attrs[\'aria-pressed\']" @click="$emit(\'click\')">{{ label }}</button>', props: ['label'], emits: ['click'] },
    } },
  })
  expect(wrapper.find('a').attributes('href')).toBe('/movie/7')
  expect(wrapper.find('a button').exists()).toBe(false)
  expect(wrapper.get('button').text()).toBe('+')
  expect(wrapper.get('button').attributes('aria-label')).toBe('Add A Film to watchlist')
  await wrapper.get('button').trigger('click')
  expect(wrapper.emitted('watchlist')).toHaveLength(1)
  await wrapper.setProps({ saving: true })
  expect(wrapper.get('button').text()).toBe('')
  await wrapper.setProps({ saving: false })
  await wrapper.setProps({ saved: true })
  expect(wrapper.get('button').text()).toBe('−')
  expect(wrapper.get('button').attributes('aria-label')).toBe('Remove A Film from watchlist')
})
