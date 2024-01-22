<template>
  <div class="content-bases-page-container">
    <section class="repository-base-edit">
      <section class="repository-base-edit__header">
        <unnnic-button
          size="small"
          type="tertiary"
          icon-center="arrow_left_alt"
          scheme="neutral-dark"
          @click="$emit('back')"
        />

        <div>
          <div class="repository-base-edit__header--content">
            <unnnic-skeleton-loading
              v-if="loadingTitle"
              tag="div"
              width="180px"
              height="28px"
            />

            <h1
              v-else
              ref="focusInput"
              class="repository-base-edit__title"
              :contenteditable="canEditTitle"
              @input="$emit('update:title', $event)"
              id="titleId"
            >
              {{ title }}
            </h1>
          </div>
        </div>
      </section>

      <section v-if="description" class="repository-base-edit__description">
        {{ description }}
      </section>
    </section>

    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    loadingTitle: Boolean,
    title: String,
    canEditTitle: Boolean,
    description: String,
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.content-bases-page-container {
  background-color: $unnnic-color-background-snow;
  padding: $unnnic-spacing-md $unnnic-font-size * 8;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  .repository-base-edit {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-bottom: $unnnic-spacing-md;

    &__description {
      margin-top: $unnnic-spacing-sm;

      color: $unnnic-color-neutral-dark;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-regular;
    }

    &__header {
      display: flex;
      align-items: center;
      column-gap: $unnnic-spacing-ant;

      &__buttons {
        display: flex;
        justify-content: space-between;

        .unnnic-tooltip {
          height: 46px;
          &:nth-child(2) {
            margin: 0 $unnnic-inset-nano;
          }
          &:nth-child(3) {
            margin-right: $unnnic-inset-nano;
          }
        }
      }
      &__button {
        width: 46px;
        height: 46px;
      }
      &--content {
        display: flex;
        align-items: center;
      }
      span {
        cursor: pointer;
        margin-right: $unnnic-spacing-xs;
      }
    }

    &__title {
      border: none;
      margin-right: $unnnic-inset-nano;
      padding: 0;
      margin: 0;

      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-title-sm;
      line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-bold;

      &:focus {
        border: none;
        border-radius: 2pt;
        box-shadow: 0 0 0 1pt grey;
        outline: none;
        transition: 0.1s;
      }
    }
  }
}
</style>
