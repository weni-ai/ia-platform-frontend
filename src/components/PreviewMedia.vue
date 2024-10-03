<template>
  <img
    v-if="mediaType === 'image'"
    class="preview-media"
    :src="mediaUrl"
  />

  <UnnnicIntelligenceVideo
    v-else-if="mediaType === 'video'"
    class="preview-media"
    :src="mediaUrl"
  />

  <MapViewport
    v-else-if="mediaType === 'geolocation'"
    :geolocation="media"
  />
</template>

<script setup>
import { computed } from 'vue';

import { getFileType } from '@/utils/medias';

import UnnnicIntelligenceVideo from '@/components/unnnic-intelligence/Video.vue';
import MapViewport from './MapViewport.vue';

const { media } = defineProps({
  media: {
    type: [File, String],
    default: null,
  },
});

const mediaType = getFileType(media);
const mediaUrl = computed(() => (media ? URL.createObjectURL(media) : ''));
</script>

<style scoped lang="scss">
.preview-media {
  overflow: hidden;

  width: 100%;
  height: 100%;

  border-radius: calc($unnnic-border-radius-md - $unnnic-border-radius-sm / 2);
}
</style>
