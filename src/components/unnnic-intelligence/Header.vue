<template>
  <div>
    <unnnic-card
      type="title"
      :title="title"
      :hasInformationIcon="false"
      :icon="icon"
      :scheme="iconScheme"
    />

    <p
      v-html="description"
      class="description"
    ></p>
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
}
</script>

<style lang="scss" scoped>
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.description {
  max-width: 32 * $unnnic-font-size;

  color: $unnnic-color-neutral-dark;
  font-family: $unnnic-font-family-secondary;
  font-weight: $unnnic-font-weight-regular;
  font-size: $unnnic-font-size-body-gt;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;

  margin-block-start: $unnnic-spacing-sm;
  margin-block-end: 0;

  /deep/ a {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: $unnnic-spacing-nano;
    font-weight: $unnnic-font-weight-bold;

    &:hover {
      color: $unnnic-color-neutral-darkest;
    }
  }
}
</style>
