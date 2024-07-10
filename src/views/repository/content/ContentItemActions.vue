<template>
  <UnnnicIcon
    ref="selector"
    v-popover.trigger="{
      onClick($event) {
        isClickActivated = $event;
      },
    }"
    icon="more_vert"
    :scheme="isClickActivated ? 'neutral-darkest' : 'neutral-cloudy'"
    size="avatar-nano"
    class="button-menu"
  />

  <Teleport to="body">
    <section
      v-popover.detached
      activator="click"
      class="options"
      horizontal="right-right"
      vertical="top-bottom"
    >
      <section
        v-for="(action, index) in actions"
        :key="index"
        class="options__option"
        @click="
          action.onClick();
          close($refs.selector.$el);
        "
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
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import vPopover from '@/utils/vPopover.js';

defineProps({
  actions: {
    type: Array,
    default: () => [],
  },
});

const isClickActivated = ref(false);

function close(el) {
  el.dispatchEvent(new Event('closeclick'));
}
</script>

<style lang="scss" scoped>
.button-menu {
  user-select: none;
  cursor: pointer;
}

.options {
  border-radius: $unnnic-border-radius-sm;
  background-color: $unnnic-color-background-snow;
  box-shadow: $unnnic-shadow-level-near;
  min-width: 10.625 * $unnnic-font-size;

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
