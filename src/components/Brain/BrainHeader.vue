<template>
  <header class="header">
    <section class="header__title">
      <section>
        <UnnnicAvatarIcon
          size="sm"
          :icon="currentBrainRoute?.icon"
          scheme="aux-purple-500"
        />
      </section>

      <p class="header__title__text">
        {{ $t(`router.tabs.${currentBrainRoute?.title}`) }}
      </p>
    </section>
    <section>
      <UnnnicButton
        v-if="route.name !== 'router-actions'"
        class="save-button"
        :disabled="$store.getters.isBrainSaveButtonDisabled"
        :loading="$store.state.Brain.isSavingChanges"
        @click="$store.dispatch('saveBrainChanges')"
      >
        {{ $t('router.tunings.save_changes') }}
      </UnnnicButton>
    </section>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { BRAIN_ROUTES } from '@/utils';

const brainRoutes = ref(BRAIN_ROUTES);

const route = useRoute();

const currentBrainRoute = computed(() => {
  return (
    brainRoutes.value.find((e) => e.page === route.name) || brainRoutes.value[0]
  );
});
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $unnnic-spacing-sm;

  &__title {
    display: flex;
    gap: $unnnic-spacing-ant;
    align-items: center;

    &__text {
      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-title-sm;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-bold;
    }
  }
}

.save-button {
  width: 18.5 * $unnnic-font-size;
  margin-left: auto;
}
</style>
