// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MovieFilters from '../app/components/movie/MovieFilters.vue'
import MovieInformation from '../app/components/movie/MovieInformation.vue'

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
