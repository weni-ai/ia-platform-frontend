<template>
  <section class="history-item">
    <UnnnicIcon
      :icon="icon"
      size="ant"
      scheme="neutral-cloudy"
      data-test="history-icon"
    />
    <p class="history-item__user">{{ user }}</p>
    <p class="history-item__text">{{ text }}</p>
  </section>
  <section
    v-if="groupText.length > 0 && isRenderGroupText"
    class="history-item__description"
  >
    <p
      v-for="(textItem, index) in groupText"
      :key="index"
      class="history-item__text"
    >
      {{ textItem }}
    </p>
  </section>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
    default: 'article',
  },
  user: {
    type: String,
    required: true,
  },
  isRenderGroupText: {
    type: Boolean,
    default: false,
  },
  groupText: {
    type: Array,
    required: false,
    default() {
      return [];
    },
  },
});
</script>

<style scoped lang="scss">
.history-item {
  display: flex;
  align-items: center;

  &__user {
    margin-left: $unnnic-spacing-xs;
    margin-right: $unnnic-spacing-nano;
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-bold;
    font-style: normal;
    font-size: $unnnic-font-size-body-gt;
  }

  &__text {
    overflow: hidden;
    color: $unnnic-color-neutral-cloudy;
    text-overflow: ellipsis;

    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-style: normal;
    font-weight: $unnnic-font-weight-regular;
  }

  &__description {
    margin-left: $unnnic-spacing-md + $unnnic-spacing-nano;
    gap: $unnnic-spacing-ant;
    margin-top: $unnnic-spacing-ant;
    display: flex;
    flex-direction: column;
  }
}
</style>
