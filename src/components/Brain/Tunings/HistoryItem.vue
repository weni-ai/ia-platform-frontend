<template>
  <section class="history-item">
    <UnnnicIcon
      :icon="icon"
      size="ant"
    />
    <p class="history-item__user">{{ user }}</p>
    <p class="history-item__text">{{ text }}</p>
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
  column: {
    type: String,
    required: false,
    default: '',
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
}
</style>
