<template>
  <section class="not-found">
    <UnnnicIcon
      :icon="isProjectUsingBedrock ? 'info' : 'warning'"
      size="avatar-sm"
      scheme="neutral-cleanest"
    />

    <UnnnicIntelligenceText
      color="neutral-dark"
      family="secondary"
      size="body-gt"
      weight="bold"
      marginTop="xs"
    >
      {{ title }}
    </UnnnicIntelligenceText>

    <UnnnicIntelligenceText
      v-if="!isProjectUsingBedrock"
      color="neutral-cloudy"
      family="secondary"
      size="body-gt"
      marginTop="nano"
    >
      <span v-html="$t('content_bases.files.preview.not_found.description')" />
    </UnnnicIntelligenceText>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

import i18n from '@/utils/plugins/i18n';

const store = useStore();

const isProjectUsingBedrock = computed(
  () => store.state.Brain.tunings.indexer_database?.toLowerCase() === 'bedrock',
);

const title = computed(() =>
  isProjectUsingBedrock.value
    ? i18n.global.t('content_bases.files.preview.bedrock.title')
    : i18n.global.t('content_bases.files.preview.not_found.title'),
);
</script>

<style lang="scss" scoped>
.not-found {
  $skeleton-loading-height: 30.125 * $unnnic-font-size;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: $skeleton-loading-height;
}
</style>
