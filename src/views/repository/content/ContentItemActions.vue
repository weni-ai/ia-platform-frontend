<template>
  <Popover
    ref="popover"
    v-model:isActivatedByClick="isActivatedByClick"
  >
    <template #default>
      <UnnnicIcon
        ref="selector"
        :icon="triggerIcon"
        :scheme="isActivatedByClick ? 'neutral-darkest' : 'neutral-cloudy'"
        :size="triggerSize"
        class="button-menu"
        v-bind="$attrs"
      />
    </template>

    <template #children="{ popoverId }">
      <section
        :popoverId
        trigger="click"
        :horizontal="popoverPositionHorizontal"
        :vertical="popoverPositionVertical"
        class="options"
        :style="{ minWidth }"
      >
        <section
          v-for="(action, index) in actions"
          :key="index"
          class="options__option"
          :data-test="action.text"
          @click="onClick(action)"
        >
          <UnnnicIcon
            :icon="action.icon"
            size="sm"
            :scheme="action.scheme"
          />

          <UnnnicIntelligenceText
            tag="p"
            :color="action.scheme"
            family="secondary"
            size="body-md"
          >
            {{ action.text }}
          </UnnnicIntelligenceText>
        </section>
      </section>
    </template>
  </Popover>
</template>

<script setup>
import Popover from '@/views/Brain/Popover.vue';
import { ref } from 'vue';

defineProps({
  actions: {
    type: Array,
    default: () => [],
  },

  triggerIcon: {
    type: String,
    default: 'more_vert',
  },
  triggerSize: {
    type: String,
    default: 'avatar-nano',
  },

  popoverPositionHorizontal: {
    type: String,
    default: 'right-right',
  },
  popoverPositionVertical: {
    type: String,
    default: 'top-bottom',
  },

  minWidth: {
    type: String,
    default: '170px',
  },
});

const isActivatedByClick = ref(false);

function onClick(action) {
  isActivatedByClick.value = false;
  action.onClick();
}
</script>

<style lang="scss" scoped>
.dropdown :deep(.unnnic-dropdown__trigger) {
  display: flex;
}

.button-menu {
  user-select: none;
  cursor: pointer;
}

.options {
  margin-block: $unnnic-spacing-nano;
  border-radius: $unnnic-border-radius-sm;
  background-color: $unnnic-color-background-snow;
  box-shadow: $unnnic-shadow-level-near;

  &__option {
    user-select: none;
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: $unnnic-spacing-sm;
    column-gap: $unnnic-spacing-xs;
    position: relative;
  }

  &__option + &__option::before {
    pointer-events: none;
    content: ' ';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    border-top: $unnnic-border-width-thinner solid
      $unnnic-color-neutral-lightest;
    margin-inline: $unnnic-spacing-sm;
  }
}
</style>
