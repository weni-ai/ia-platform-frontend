<template>
  <section class="history-data">
    <p class="history-data__text">{{ text }}</p>
    <UnnnicButton
      v-if="isRenderIcon"
      :iconCenter="isCollapsed ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
      size="small"
      type="tertiary"
      class="history-data__icon"
      @click="toggleCollapse"
    />
  </section>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  text: {
    type: String,
    required: true,
  },
  isRenderIcon: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:isCollapsed']);

const isCollapsed = ref(false);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  emit('update:isCollapsed', isCollapsed.value);
};
</script>

<style scoped lang="scss">
.history-data {
  display: flex;
  justify-content: space-between;

  &__text {
    overflow: hidden;
    color: $unnnic-color-neutral-cloudy;
    text-overflow: ellipsis;

    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-style: normal;
    font-weight: $unnnic-font-weight-regular;
  }

  :deep(.unnnic-button--icon-on-center.unnnic-button--size-small) {
    padding: 0px;
    height: 22px;
    width: 22px;
  }
  &__icon {
    :deep(.material-symbols-rounded.unnnic-icon-size--sm) {
      font-size: 20px;
    }
  }
}
</style>
