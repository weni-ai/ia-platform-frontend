<template>
  <div class="content-bases-page-container">
    <section
      v-if="brainIsDeactivated"
      class="news-bar news-bar--warn"
    >
      <UnnnicIntelligenceText
        color="neutral-white"
        family="secondary"
        weight="bold"
        size="body-lg"
      >
        {{ $t('router.warn.brain_is_deactivated') }}

        <RouterLink
          :to="{ name: 'router-tunings', query: { activate_brain: true } }"
        >
          {{ $t('router.warn.click_here') }}
        </RouterLink>

        {{ $t('router.warn.activate_it') }}
      </UnnnicIntelligenceText>
    </section>

    <section class="repository-base-edit">
      <section class="repository-base-edit__header">
        <UnnnicAvatarIcon
          v-if="dontShowBack"
          size="sm"
          icon="hub"
          scheme="aux-purple-500"
        />

        <UnnnicButton
          v-else
          size="small"
          type="tertiary"
          iconCenter="arrow_left_alt"
          scheme="neutral-dark"
          @click="$emit('back')"
        />

        <div>
          <div class="repository-base-edit__header--content">
            <UnnnicSkeletonLoading
              v-if="loadingTitle"
              tag="div"
              width="180px"
              height="28px"
            />

            <h1
              v-else
              id="titleId"
              ref="focusInput"
              class="repository-base-edit__title"
              :contenteditable="canEditTitle"
              @update:model-value="$emit('update:title', $event)"
            >
              {{ title }}
            </h1>
          </div>
        </div>

        <slot name="actions"></slot>
      </section>

      <section
        v-if="description"
        class="repository-base-edit__description"
      >
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
    dontShowBack: Boolean,
    brainIsDeactivated: Boolean,
  },
  emits: ['back'],
};
</script>

<style lang="scss" scoped>
.news-bar {
  margin: -$unnnic-spacing-lg;
  margin-bottom: $unnnic-spacing-md;
  padding: $unnnic-spacing-ant $unnnic-spacing-lg;

  &--warn {
    background-color: $unnnic-color-aux-yellow-500;
  }

  a {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: $unnnic-spacing-nano;
  }
}

.content-bases-page-container {
  background-color: $unnnic-color-background-snow;
  padding: $unnnic-spacing-lg;
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
