<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import type { Genre } from '../../types/movie'

const props = defineProps<{ query: string; genre: number | null; genres: Genre[]; busy?: boolean }>()
const emit = defineEmits<{ search: [query: string]; genre: [id: number | null] }>()
const draft = shallowRef(props.query)
watch(() => props.query, value => { draft.value = value })

function submit() { emit('search', draft.value.trim()) }
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
    <form class="flex-1" role="search" @submit.prevent="submit">
      <label for="film-search" class="mb-2 block text-sm font-semibold">Search by title</label>
      <div class="flex gap-2">
        <InputText id="film-search" v-model="draft" name="q" autocomplete="off" placeholder="Search films…" class="w-full" />
        <Button type="submit" label="Search" :loading="busy" />
      </div>
    </form>
    <div class="sm:w-64">
      <label for="film-genre" class="mb-2 block text-sm font-semibold">Browse by genre</label>
      <Select id="film-genre" :model-value="genre" :options="genres" option-label="name" option-value="id" placeholder="All genres" show-clear class="w-full" @update:model-value="emit('genre', $event ?? null)" />
    </div>
  </div>
</template>
