<!-- eslint-disable max-len -->
<template>
  <div class="api-loading">
    <div class="api-loading__container">
      <div class="api-loading__container__title">
        <UnnnicSkeletonLoading
          tag="div"
          width="437px"
          height="20px"
        />
      </div>

      <div class="api-loading__container__url">
        <UnnnicSkeletonLoading
          tag="div"
          width="95px"
          height="20px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="1029px"
          height="20px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="678px"
          height="20px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="1029px"
          height="60px"
        />
      </div>

      <div class="api-loading__container__headers">
        <UnnnicSkeletonLoading
          tag="div"
          width="95px"
          height="20px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="1029px"
          height="20px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="678px"
          height="20px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="95px"
          height="20px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="1029px"
          height="60px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="1029px"
          height="60px"
        />
      </div>

      <div class="api-loading__container__post">
        <UnnnicSkeletonLoading
          tag="div"
          width="95px"
          height="20px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="1029px"
          height="20px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="678px"
          height="20px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="1029px"
          height="60px"
        />
      </div>

      <div class="api-loading__container__response">
        <UnnnicSkeletonLoading
          tag="div"
          width="95px"
          height="20px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="1029px"
          height="20px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="678px"
          height="20px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="1029px"
          height="250px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="1029px"
          height="60px"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@weni/unnnic-system/dist/unnnic.css';
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

.api-loading {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  padding-bottom: $unnnic-spacing-stack-sm;

  &__container {
    &__title {
      margin-bottom: $unnnic-spacing-stack-md;
    }

    &__headers {
      margin: $unnnic-spacing-stack-md 0px;
    }

    &__response {
      margin: $unnnic-spacing-stack-md 0px;
    }
  }
}
</style>
