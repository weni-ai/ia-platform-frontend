<template>
  <button
    v-if="showLoadContextButton"
    class="button-load-previous"
    @click="loadMessageContext"
  >
    <UnnnicIcon
      icon="refresh"
      size="xs"
      scheme="neutral-cloudy"
      clickable
    />
    <UnnnicIntelligenceText
      color="neutral-cloudy"
      family="secondary"
      size="body-md"
      tag="p"
    >
      {{ $t('router.monitoring.load_previous_messages') }}
    </UnnnicIntelligenceText>
  </button>

  <template v-if="inspectedAnswer.context?.data.length || isLoadingContext">
    <QuestionAndAnswer
      v-for="fragment of inspectedAnswer.context?.data"
      :key="fragment.id"
      :isLoading="isLoadingContext"
      :data="fragment"
    />
  </template>
</template>

<script setup>
import { useMonitoringStore } from '@/store/Monitoring';
import { computed } from 'vue';

import QuestionAndAnswer from './QuestionAndAnswer.vue';

const monitoringStore = useMonitoringStore();
const inspectedAnswer = computed(
  () => monitoringStore.messages.inspectedAnswer,
);

const loadingContext = computed(() => inspectedAnswer.value.context?.status);

const isLoadingContext = computed(() => loadingContext.value === 'loading');

const showLoadContextButton = computed(
  () => !loadingContext.value || loadingContext.value === 'error',
);

function loadMessageContext() {
  monitoringStore.loadMessageContext({ id: inspectedAnswer.value.id });
}
</script>

<style scoped lang="scss">
.button-load-previous {
  border: none;
  background: none;

  margin: auto;

  display: flex;
  gap: $unnnic-spacing-nano;
  justify-content: center;
  align-items: center;

  cursor: pointer;
}
</style>
