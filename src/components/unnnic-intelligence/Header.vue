<template>
  <div class="intelligence-header">
    <div>
      <UnnnicCard
        type="title"
        :title="title"
        :hasInformationIcon="false"
        :icon="icon"
        :scheme="iconScheme"
      />

      <p
        class="description"
        v-html="description"
      ></p>
    </div>

    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    icon: String,
    iconScheme: String,
    description: String,
  },
};
</script>

<style lang="scss" scoped>
.description {
  max-width: 32 * $unnnic-font-size;

  color: $unnnic-color-neutral-dark;
  font-family: $unnnic-font-family-secondary;
  font-weight: $unnnic-font-weight-regular;
  font-size: $unnnic-font-size-body-gt;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;

  margin-block-start: $unnnic-spacing-sm;
  margin-block-end: 0;

  :deep(a) {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: $unnnic-spacing-nano;
    font-weight: $unnnic-font-weight-bold;

    &:hover {
      color: $unnnic-color-neutral-darkest;
    }
  }
}

.intelligence-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
