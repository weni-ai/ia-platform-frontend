<template>
  <section class="news-bar news-bar--warn">
    <UnnnicIntelligenceText
      color="neutral-white"
      family="secondary"
      weight="bold"
      size="body-lg"
      data-test="news-bar-text"
    >
      {{ $t('router.warn.brain_is_deactivated') }}

      <RouterLink :to="routerLinkTo">
        {{ $t('router.warn.click_here') }}
      </RouterLink>

      {{ $t('router.warn.activate_it') }}
    </UnnnicIntelligenceText>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const routerLinkTo = computed(() => ({
  name: 'router-tunings',
  query: { activate_brain: true },
}));
</script>

<style lang="scss" scoped>
.news-bar {
  padding: $unnnic-spacing-ant $unnnic-spacing-lg;

  &--warn {
    background-color: $unnnic-color-aux-yellow-500;
  }

  a {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: $unnnic-spacing-nano;
  }
}
</style>
