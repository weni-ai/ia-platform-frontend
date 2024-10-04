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

  <PreviewDocument
    v-else-if="mediaType === 'document'"
    :document="media"
  />

  <MapViewport
    v-else-if="mediaType === 'geolocation'"
    :geolocation="media"
  />

  <UnnnicAudioRecorder
    v-else-if="mediaType === 'audio'"
    class="preview-media--audio"
    :src="mediaUrl"
    :canDiscard="false"
  />
</template>

<script setup>
import { computed } from 'vue';

import { getFileType } from '@/utils/medias';

import UnnnicIntelligenceVideo from '@/components/unnnic-intelligence/Video.vue';
import PreviewDocument from './PreviewDocument.vue';
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

  &--audio.unnnic-audio-recorder {
    padding: $unnnic-spacing-xs;

    width: auto;

    display: flex;

    :deep(.audio-player) {
      path {
        fill: $unnnic-color-background-white;
      }

      .audio-player__progress-bar {
        &::before {
          background: $unnnic-color-neutral-dark;
        }
        &::-webkit-slider-runnable-track {
          background: $unnnic-color-neutral-white;
        }
      }

      .audio-player__time {
        color: $unnnic-color-background-white;
      }
    }
  }
}
</style>
