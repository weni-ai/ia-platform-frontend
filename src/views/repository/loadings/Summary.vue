<!-- eslint-disable max-len -->
<template>
  <div class="summary-loading">
    <div class="summary-loading__header">
      <UnnnicSkeletonLoading
        class="summary-loading__title"
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
    <div class="summary-loading__description">
      <div>
        <UnnnicSkeletonLoading
          tag="div"
          width="507px"
          height="22px"
        />
        <div class="summary-loading__tags">
          <UnnnicSkeletonLoading
            tag="div"
            width="60px"
            height="29px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="84px"
            height="29px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="63px"
            height="29px"
          />
        </div>
      </div>
      <UnnnicSkeletonLoading
        tag="div"
        width="261px"
        height="50px"
      />
    </div>

    <UnnnicDivider />

    <div class="summary-loading__info">
      <div class="summary-loading__info__section">
        <div class="summary-loading__info__section__header">
          <UnnnicSkeletonLoading
            class="summary-loading__title"
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
        <div class="summary-loading__info__cards">
          <UnnnicSkeletonLoading
            tag="div"
            width="158px"
            height="104px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="158px"
            height="104px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="158px"
            height="104px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="158px"
            height="104px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="158px"
            height="104px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="158px"
            height="104px"
          />
        </div>
      </div>
      <div class="summary-loading__info__section">
        <div class="summary-loading__info__section__header">
          <UnnnicSkeletonLoading
            class="summary-loading__title"
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
        <div class="summary-loading__chart">
          <UnnnicSkeletonLoading
            tag="div"
            width="332px"
            height="200px"
          />
        </div>
      </div>
    </div>

    <div class="summary-loading__tabs">
      <UnnnicSkeletonLoading
        tag="div"
        width="94px"
        height="24px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="94px"
        height="24px"
      />
    </div>

    <UnnnicDivider />

    <div class="summary-loading__entities">
      <UnnnicSkeletonLoading
        tag="div"
        width="128px"
        height="36px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="109px"
        height="36px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="113px"
        height="36px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="112px"
        height="36px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="162px"
        height="36px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="98px"
        height="36px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="100px"
        height="36px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="171px"
        height="36px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="158px"
        height="36px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="139px"
        height="36px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="181px"
        height="36px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="133px"
        height="36px"
      />
    </div>
  </div>
</template>

<script>
export default {
  components: {},
};
</script>

<style lang="scss" scoped>
@import '@weni/unnnic-system/dist/unnnic.css';
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

.summary-loading {
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
  }

  &__description {
    display: flex;
    justify-content: space-between;
  }

  &__tags {
    display: flex;
    gap: $unnnic-spacing-inline-sm;
    margin-top: $unnnic-spacing-stack-sm;
  }

  &__chart {
    display: flex;
    justify-content: center;
    margin-top: $unnnic-spacing-stack-md;
  }

  &__info {
    display: flex;

    &__section {
      width: 50%;

      &__header {
        display: flex;
        align-items: center;
        gap: $unnnic-spacing-inline-sm;
      }
    }

    &__cards {
      display: flex;
      gap: $unnnic-spacing-inline-sm;
      flex-wrap: wrap;
      margin-top: $unnnic-spacing-stack-md;
    }
  }

  &__tabs {
    margin-top: $unnnic-spacing-stack-lg;
    display: flex;
    gap: $unnnic-spacing-inline-sm;
  }

  &__entities {
    display: flex;
    flex-wrap: wrap;
    gap: $unnnic-spacing-inline-sm;
  }
}
</style>
