<!-- eslint-disable max-len -->
<template>
  <div class="settings-loading">
    <div class="settings-loading__header">
      <UnnnicSkeletonLoading
        class="settings-loading__title"
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
    <div class="settings-loading__description">
      <div>
        <UnnnicSkeletonLoading
          tag="div"
          width="507px"
          height="17px"
        />
      </div>
    </div>
    <div class="settings-loading__tabs">
      <UnnnicSkeletonLoading
        tag="div"
        width="150px"
        height="20px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="150px"
        height="20px"
      />
    </div>

    <UnnnicDivider />

    <div class="settings-loading__container">
      <div class="settings-loading__container__field">
        <UnnnicSkeletonLoading
          tag="div"
          width="95px"
          height="20px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="1029px"
          height="45px"
        />
      </div>

      <div class="settings-loading__container__field">
        <UnnnicSkeletonLoading
          tag="div"
          width="95px"
          height="20px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="1029px"
          height="45px"
        />
      </div>

      <div class="settings-loading__container__field">
        <UnnnicSkeletonLoading
          tag="div"
          width="95px"
          height="20px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="1029px"
          height="45px"
        />
      </div>

      <div class="settings-loading__container__field">
        <UnnnicSkeletonLoading
          tag="div"
          width="95px"
          height="20px"
        />
        <div class="settings-loading__container__categories">
          <UnnnicSkeletonLoading
            tag="div"
            width="125px"
            height="45px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="125px"
            height="45px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="125px"
            height="45px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="125px"
            height="45px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="125px"
            height="45px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="125px"
            height="45px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="125px"
            height="45px"
          />
        </div>
      </div>

      <div class="settings-loading__container__field">
        <UnnnicSkeletonLoading
          tag="div"
          width="95px"
          height="20px"
        />
        <div class="settings-loading__container__categories">
          <UnnnicSkeletonLoading
            tag="div"
            width="503px"
            height="65px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="503px"
            height="65px"
          />
        </div>
      </div>

      <div class="settings-loading__container__field">
        <UnnnicSkeletonLoading
          tag="div"
          width="1029px"
          height="45px"
        />
      </div>

      <div class="settings-loading__container__field">
        <UnnnicSkeletonLoading
          tag="div"
          width="1029px"
          height="45px"
        />
      </div>

      <UnnnicDivider />

      <div class="settings-loading__container__field">
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
        <div class="settings-loading__container__categories">
          <UnnnicSkeletonLoading
            tag="div"
            width="209px"
            height="45px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="209px"
            height="45px"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/dist/unnnic.css';
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
.settings-loading {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  padding-bottom: $unnnic-spacing-stack-sm;

  &__header {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-inline-sm;
    height: 80px;
  }

  &__title {
    margin: $unnnic-spacing-inline-xs 0;
  }

  &__description {
    display: flex;
    justify-content: space-between;
  }

  &__tabs {
    display: flex;
    margin-top: $unnnic-spacing-stack-md;
    gap: $unnnic-spacing-inline-sm;
  }

  &__container {
    &__field {
      margin-bottom: $unnnic-spacing-stack-sm;
    }

    &__categories {
      display: flex;
      gap: $unnnic-spacing-inline-sm;
    }
  }
}
</style>
