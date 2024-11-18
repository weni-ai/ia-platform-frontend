<template>
  <header class="header">
    <section class="header__infos">
      <section class="infos__title">
        <UnnnicAvatarIcon
          size="sm"
          :icon="currentBrainRoute?.icon"
          scheme="aux-purple-500"
        />

        <p class="title__text">
          {{ $t(`router.tabs.${currentBrainRoute?.title}`) }}
        </p>
      </section>
      <UnnnicIntelligenceText
        v-if="currentBrainRoute.description"
        tag="p"
        family="secondary"
        size="body-gt"
      >
        {{ currentBrainRoute.description }}
      </UnnnicIntelligenceText>
    </section>
    <UnnnicButton
      v-if="route.name === 'router-personalization'"
      class="save-button"
      :disabled="brainCustomization.isSaveButtonDisabled"
      :loading="brainCustomization.isSaving"
      @click="brainCustomization.save"
    >
      {{ $t('router.tunings.save_changes') }}
    </UnnnicButton>
    <UnnnicButton
      v-else-if="route.name === 'router-tunings'"
      class="save-button"
      :disabled="$store.getters.isBrainSaveButtonDisabled"
      :loading="$store.state.Brain.isSavingChanges"
      @click="$store.dispatch('saveBrainChanges')"
    >
      {{ $t('router.tunings.save_changes') }}
    </UnnnicButton>
    <UnnnicInputDatePicker
      v-else-if="showDateFilter"
      v-model="dateFilter"
      class="filter-date"
      size="sm"
      position="right"
    />
  </header>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { format, subDays } from 'date-fns';
import useBrainRoutes from '@/composables/useBrainRoutes';
import { useBrainCustomizationStore } from '@/store/BrainCustomization';

const brainRoutes = useBrainRoutes();
const dateFilter = ref({
  start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
  end: format(new Date(), 'yyyy-MM-dd'),
});

const route = useRoute();
const router = useRouter();

const brainCustomization = useBrainCustomizationStore();

const currentBrainRoute = computed(() => {
  return (
    brainRoutes.value.find((e) => e.page === route.name) || brainRoutes.value[0]
  );
});

const showDateFilter = computed(() => route.name === 'router-monitoring');

function updateQueriesAtFilterDate() {
  if (!showDateFilter.value) return;

  const { start, end } = dateFilter.value;
  router.replace({
    ...route,
    query: { started_day: start, ended_day: end },
  });
}

watch(
  () => dateFilter.value,
  () => {
    updateQueriesAtFilterDate();
  },
);

watch(
  currentBrainRoute,
  () => {
    updateQueriesAtFilterDate();
  },
  {
    immediate: true,
  },
);
</script>

<style lang="scss" scoped>
.header {
  display: grid;
  grid-template-columns: 9fr 3fr;
  gap: $unnnic-spacing-sm;
  align-items: center;
  justify-content: space-between;

  margin-bottom: $unnnic-spacing-md;

  & > *:only-child {
    grid-column: span 2;
  }

  &__infos {
    display: grid;
    gap: $unnnic-spacing-sm;

    .infos__title {
      display: flex;
      gap: $unnnic-spacing-ant;
      align-items: center;

      .title__text {
        color: $unnnic-color-neutral-darkest;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-title-sm;
        line-height: $unnnic-font-size-title-sm * 2.3;
        font-weight: $unnnic-font-weight-bold;
      }
    }
  }
}

.save-button {
  width: 18.5 * $unnnic-font-size;
  margin-left: auto;
}
.filter-date {
  :deep(.unnnic-form) {
    width: 100%;
    .unnnic-form-input {
      width: 100%;
    }
  }
}
</style>
