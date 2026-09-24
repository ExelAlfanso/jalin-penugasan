<script setup lang="ts">
defineProps<{ trailer: string | null; title: string }>()
const visible = defineModel<boolean>({ required: true })
</script>

<template>
  <Dialog v-model:visible="visible" :header="`${title} trailer`" modal dismissable-mask :style="{ width: 'min(90vw, 900px)' }">
    <div v-if="trailer" class="aspect-video bg-black">
      <iframe class="h-full w-full" :src="`https://www.youtube-nocookie.com/embed/${trailer}?autoplay=1`" :title="`${title} trailer`" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen />
    </div>
    <p v-else>Trailer unavailable for this film.</p>
  </Dialog>
</template>
