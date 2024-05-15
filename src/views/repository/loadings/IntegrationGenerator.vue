<!-- eslint-disable max-len -->
<template>
  <div class="api-loading">
    <div class="api-loading__container">
      <div class="api-loading__container__header">
        <div class="api-loading__container__header__title">
          <UnnnicSkeletonLoading
            tag="div"
            width="115px"
            height="20px"
          />
        </div>
        <div class="api-loading__container__header__description">
          <UnnnicSkeletonLoading
            tag="div"
            width="360px"
            height="20px"
          />
        </div>
      </div>

      <div class="api-loading__container__field">
        <UnnnicSkeletonLoading
          tag="div"
          width="157px"
          height="20px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="1026px"
          height="46px"
        />
      </div>

      <div class="api-loading__container__field">
        <UnnnicSkeletonLoading
          tag="div"
          width="157px"
          height="20px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="1026px"
          height="104px"
        />
      </div>

      <div class="api-loading__container__tabs">
        <UnnnicSkeletonLoading
          tag="div"
          width="95px"
          height="20px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="95px"
          height="20px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="95px"
          height="20px"
        />
      </div>

      <UnnnicDivider />

      <div class="api-loading__container__code">
        <UnnnicSkeletonLoading
          tag="div"
          width="1029px"
          height="234px"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/dist/unnnic.css';
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.api-loading {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  padding-bottom: $unnnic-spacing-stack-sm;

  &__container {
    &__header {
      padding-bottom: $unnnic-spacing-stack-sm;

      &__title {
        margin-bottom: $unnnic-spacing-stack-xs;
      }
    }

    &__field {
      padding-bottom: $unnnic-spacing-stack-sm;
    }

    &__tabs {
      display: flex;
      gap: $unnnic-spacing-inline-sm;
      padding-top: $unnnic-spacing-stack-xs;
    }
  }
}
</style>
