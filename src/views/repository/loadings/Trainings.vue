<!-- eslint-disable max-len -->
<template>
  <div class="trainings-loading">
    <div class="trainings-loading__header">
      <UnnnicSkeletonLoading
        class="trainings-loading__title"
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
    <div class="trainings-loading__description">
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

    <div class="trainings-loading__info">
      <div class="trainings-loading__info__section">
        <div class="trainings-loading__info__section__header">
          <UnnnicSkeletonLoading
            tag="div"
            width="507px"
            height="25px"
          />
        </div>
      </div>
    </div>

    <div class="trainings-loading__form">
      <UnnnicSkeletonLoading
        tag="div"
        width="507px"
        height="17px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="100%"
        height="44px"
      />
    </div>

    <UnnnicDivider />

    <div class="trainings-loading__card-wrapper">
      <UnnnicSkeletonLoading
        tag="div"
        width="249px"
        height="17px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="100%"
        height="50px"
      />
    </div>

    <div class="trainings-loading__fields">
      <div class="trainings-loading__fields__field">
        <UnnnicSkeletonLoading
          tag="div"
          width="249px"
          height="17px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="100%"
          height="44px"
        />
      </div>
      <div class="trainings-loading__fields__field">
        <UnnnicSkeletonLoading
          tag="div"
          width="249px"
          height="17px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="100%"
          height="44px"
        />
      </div>
    </div>

    <div class="trainings-loading__train-button">
      <UnnnicSkeletonLoading
        tag="div"
        width="100%"
        height="50px"
      />
    </div>

    <div class="trainings-loading__card-wrapper">
      <UnnnicSkeletonLoading
        tag="div"
        width="440px"
        height="17px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="308px"
        height="17px"
      />

      <div class="trainings-loading__resume-cards">
        <UnnnicSkeletonLoading
          tag="div"
          width="210px"
          height="104px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="210px"
          height="104px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="210px"
          height="104px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="210px"
          height="104px"
        />
        <div class="trainings-loading__buttons">
          <UnnnicSkeletonLoading
            tag="div"
            width="288px"
            height="45px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="288px"
            height="45px"
          />
        </div>
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

.trainings-loading {
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

  &__fields {
    margin-top: $unnnic-spacing-stack-md;
    display: flex;
    gap: $unnnic-spacing-inline-sm;

    &__field {
      width: 50%;
    }
  }

  &__train-button {
    margin: $unnnic-spacing-stack-lg 0;
  }

  &__info {
    display: flex;

    &__section {
      &__header {
        display: flex;
        align-items: center;
        gap: $unnnic-spacing-inline-sm;
      }
    }
  }

  &__form {
    margin-top: $unnnic-spacing-stack-lg;
  }

  &__card-wrapper {
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
    border-radius: $unnnic-border-radius-md;
    padding: $unnnic-spacing-stack-md;
  }

  &__resume-cards {
    display: flex;
    gap: $unnnic-spacing-inline-sm;
    margin-top: $unnnic-spacing-stack-md;
  }

  &__buttons {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}
</style>
