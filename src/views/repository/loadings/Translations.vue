<!-- eslint-disable max-len -->
<template>
  <div class="translations-loading">
    <div class="translations-loading__header">
      <UnnnicSkeletonLoading
        class="translations-loading__title"
        tag="div"
        width="40px"
        height="40px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="189px"
        height="40px"
      />
    </div>
    <div class="translations-loading__description">
      <div>
        <UnnnicSkeletonLoading
          tag="div"
          width="507px"
          height="17px"
        />
      </div>
    </div>

    <UnnnicDivider />

    <div class="translations-loading__fields">
      <div>
        <UnnnicSkeletonLoading
          tag="div"
          width="214px"
          height="20px"
        />
      </div>
    </div>

    <div class="translations-loading__items">
      <UnnnicSkeletonLoading
        tag="div"
        width="332px"
        height="100px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="332px"
        height="100px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="332px"
        height="100px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="332px"
        height="100px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="332px"
        height="100px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="332px"
        height="100px"
      />
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
@import '@weni/unnnic-system/dist/unnnic.css';
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

.translations-loading {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  padding-bottom: $unnnic-spacing-stack-sm;

  &__title {
    margin: $unnnic-spacing-inline-xs 0;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-inline-sm;
    height: 80px;
  }

  &__description {
    display: flex;
    justify-content: space-between;
  }

  &__fields {
    display: flex;
    justify-content: space-between;
  }

  &__items {
    margin-top: $unnnic-spacing-stack-sm;
    flex-direction: row;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
}
</style>
