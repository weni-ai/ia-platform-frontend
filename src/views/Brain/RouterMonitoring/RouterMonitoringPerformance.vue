<template>
  <section class="router-monitoring__performance">
    <UnnnicIntelligenceText
      tag="h2"
      family="secondary"
      size="body-lg"
      color="neutral-darkest"
      weight="bold"
      class="performance__title"
    >
      {{ $t('router.monitoring.performance') }}
    </UnnnicIntelligenceText>

    <section
      v-for="(answer, key) in Object.entries(answers)"
      :key="key"
      :class="['performance__card', `performance__card--${answer[0]}`]"
    >
      <header class="card__header">
        <UnnnicIntelligenceText
          tag="h3"
          family="secondary"
          size="body-gt"
          color="neutral-darkest"
        >
          {{ answer[1].title }}
        </UnnnicIntelligenceText>

        <UnnnicToolTip
          side="top"
          :text="answer[1].tooltip"
          enabled
          maxWidth="18rem"
          class="header__tooltip"
        >
          <UnnnicIcon
            icon="info"
            size="sm"
            scheme="neutral-cleanest"
            filled
          />
        </UnnnicToolTip>
      </header>

      <UnnnicIntelligenceText
        tag="p"
        family="secondary"
        size="title-md"
        color="neutral-darkest"
        weight="bold"
      >
        {{ answer[1].value }}%
      </UnnnicIntelligenceText>
    </section>
  </section>
</template>
<script setup>
import i18n from '@/utils/plugins/i18n';
import { ref } from 'vue';

const answers = ref({
  success: {
    title: i18n.global.t('router.monitoring.success.title'),
    tooltip: i18n.global.t('router.monitoring.success.tooltip'),
    value: 0,
  },
  failed: {
    title: i18n.global.t('router.monitoring.failed.title'),
    tooltip: i18n.global.t('router.monitoring.failed.tooltip'),
    value: 0,
  },
  action: {
    title: i18n.global.t('router.monitoring.action.title'),
    tooltip: i18n.global.t('router.monitoring.action.tooltip'),
    value: 0,
  },
});
</script>

<style lang="scss" scoped>
.router-monitoring__performance {
  display: grid;
  gap: $unnnic-spacing-sm;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto 1fr;

  .performance__title {
    grid-column: 1 / -1;
  }

  .performance__card {
    padding: $unnnic-spacing-md $unnnic-spacing-sm;

    border-radius: $unnnic-border-radius-sm;
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-cleanest;
    border-left-width: $unnnic-border-width-thick;

    &--success {
      border-left-color: $unnnic-color-aux-green-300;
    }

    &--failed {
      border-left-color: $unnnic-color-aux-red-300;
    }
    &--action {
      border-left-color: $unnnic-color-aux-blue-300;
    }

    .card__header {
      display: flex;
      gap: $unnnic-spacing-xs;
      align-items: center;

      .header__tooltip {
        display: flex;
        cursor: default;
      }
    }
  }
}
</style>
