<template>
  <section
    :class="[
      'brain-header-preview__header',
      brainOn
        ? 'brain-header-preview__preview-padding-active'
        : 'brain-header-preview__preview-padding',
    ]"
  >
    <section>
      <p class="brain-header-preview__header__title">
        {{ $t('router.preview.title') }}
      </p>
      <section
        v-if="brainOn"
        class="brain-header-preview__header__brain-active"
      >
        <UnnnicIcon
          class="brain-header-preview__record-icon"
          icon="fiber_manual_record"
          :filled="true"
          size="sm"
          scheme="aux-green-300"
          data-test="preview-brain-icon"
        />
        <UnnnicIntelligenceText
          tag="p"
          family="secondary"
          color="neutral-cloudy"
          size="body-md"
          weight="regular"
          data-test="preview-brain-text"
        >
          {{ $t('router.preview.active') }}
        </UnnnicIntelligenceText>
      </section>
    </section>

    <ContentItemActions
      data-test="dropdown-actions"
      :actions="props.previewActions"
      minWidth="175px"
    />
  </section>
</template>

<script setup>
import ContentItemActions from '@/views/repository/content/ContentItemActions.vue';
import { toRefs } from 'vue';

const props = defineProps({
  brainOn: {
    type: Boolean,
    required: true,
  },
  previewActions: {
    type: Array,
    required: true,
  },
});

const { brainOn } = toRefs(props);
</script>

<style lang="scss" scoped>
.brain-header-preview__header {
  max-width: 390px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid $unnnic-color-neutral-soft;

  &__title {
    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-lg;
    line-height: calc($unnnic-font-size-body-lg + $unnnic-line-height-md);
    font-weight: $unnnic-font-weight-bold;
  }

  &__brain-active {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-nano;
  }
}

.brain-header-preview__preview-padding-active {
  padding: $unnnic-spacing-sm;
}

.brain-header-preview__preview-padding {
  padding: $unnnic-spacing-md $unnnic-spacing-sm;
}

.brain-header-preview__record-icon {
  animation: blink 1s infinite;

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
}
</style>
