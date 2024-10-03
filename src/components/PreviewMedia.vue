<template>
  <img
    v-if="isImage"
    class="preview-media"
    :src="mediaUrl"
  />
  <UnnnicIntelligenceVideo
    v-else-if="isVideo"
    class="preview-media"
    :src="mediaUrl"
  />
</template>

<script setup>
import UnnnicIntelligenceVideo from '@/components/unnnic-intelligence/Video.vue';

import { computed } from 'vue';

const { src } = defineProps({
  src: {
    type: File,
    default: null,
  },
});

const mediaUrl = computed(() => (src ? URL.createObjectURL(src) : ''));

const isImage = computed(() => src?.type.startsWith('image/'));
const isVideo = computed(() => src?.type.startsWith('video/'));
</script>

<style scoped lang="scss">
.preview-media {
  overflow: hidden;

  width: 100%;
  height: 100%;

  border-radius: calc($unnnic-border-radius-md - $unnnic-border-radius-sm / 2);
}
</style>
