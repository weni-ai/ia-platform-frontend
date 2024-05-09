<!-- eslint-disable max-len -->
<template>
  <div class="log-loading">
    <div class="log-loading__header">
      <UnnnicSkeletonLoading
        class="log-loading__title"
        tag="div"
        width="40px"
        height="40px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="189px"
        height="40px"
      />
      <UnnnicSkeletonLoading
        class="log-loading__button"
        tag="div"
        width="261px"
        height="50px"
      />
    </div>
    <div class="log-loading__description">
      <div>
        <UnnnicSkeletonLoading
          tag="div"
          width="507px"
          height="17px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="507px"
          height="17px"
        />
      </div>
    </div>

    <UnnnicDivider />

    <div class="log-loading__fields">
      <div>
        <UnnnicSkeletonLoading
          tag="div"
          width="384px"
          height="45px"
        />
      </div>
      <div class="log-loading__fields__selects">
        <UnnnicSkeletonLoading
          tag="div"
          width="227px"
          height="45px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="227px"
          height="45px"
        />
      </div>
    </div>

    <div class="log-loading__table">
      <UnnnicSkeletonLoading
        tag="div"
        width="100%"
        height="60px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="100%"
        height="60px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="100%"
        height="60px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="100%"
        height="60px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="100%"
        height="60px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="100%"
        height="60px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="100%"
        height="60px"
      />
    </div>

    <UnnnicDivider />

    <div class="log-loading__fields">
      <div>
        <UnnnicSkeletonLoading
          tag="div"
          width="126px"
          height="36px"
        />
      </div>
      <div class="log-loading__fields__selects">
        <UnnnicSkeletonLoading
          tag="div"
          width="300px"
          height="36px"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
@import '@weni/unnnic-system/dist/unnnic.css';
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

.log-loading {
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

  &__button {
    margin-left: auto;
    align-self: end;
  }

  &__fields {
    display: flex;
    justify-content: space-between;

    &__selects {
      display: flex;
      gap: $unnnic-spacing-inline-sm;
    }
  }

  &__table {
    margin-top: $unnnic-spacing-stack-sm;
  }
}
</style>
