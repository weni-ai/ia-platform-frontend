<template>
  <div class="side-bar__container" @click.self="$emit('close')">
    <div class="side-bar__content">
      <div class="side-bar__content__scrollable">
        <div class="side-bar__header">
          <div class="side-bar__header__title">
            {{ $t('content_bases.sidebar_quick_test_title', { name }) }}

            <unnnic-button
              class="side-bar__header__title__close-button"
              size="small"
              type="tertiary"
              icon-center="close"
              scheme="neutral-dark"
              @click="$emit('close')"
            />
          </div>

          <div class="side-bar__header__description">
            {{ $t('content_bases.sidebar_quick_test_description') }}
          </div>
        </div>

        <div class="content-bases-list">
          <tests
            :content-base-uuid="repositoryUuid"
            :content-base-language="repositoryLanguage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import Tests from '../../../views/repository/content/Tests';

export default {
  props: {
    name: String,
    repositoryUuid: String,
    repositoryLanguage: String,
    id: Number,
  },

  components: {
    Tests,
  },

  data() {
    return {
      loading: false,
      configTest: '',
    };
  },

  methods: {
    ...mapActions(['getQATexts']),
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.content-bases-list {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-xs;
  height: 100%;

  outline-style: solid;
  outline-color: $unnnic-color-neutral-soft;
  outline-width: $unnnic-border-width-thinner;
  outline-offset: -$unnnic-border-width-thinner;
  border-radius: $unnnic-border-radius-md;
  padding: $unnnic-spacing-sm;
}

.side-bar {
  &__header {
    margin-bottom: $unnnic-spacing-sm;

    &__title {
      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-title-sm;
      line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-bold;

      display: flex;
      align-items: center;
      gap: $unnnic-spacing-sm;
      justify-content: space-between;
      margin-bottom: $unnnic-spacing-sm;

      &__close-button {
        align-self: self-start;
      }
    }

    &__description {
      color: $unnnic-color-neutral-cloudy;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-regular;
    }
  }

  &__container {
    z-index: 1;
    background: rgba(#262626, $unnnic-opacity-level-overlay);
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: flex-end;
  }

  &__content {
    flex: 1;
    max-width: 29 * $unnnic-font-size;
    background-color: $unnnic-color-background-snow;
    padding: $unnnic-spacing-md $unnnic-spacing-lg;
    box-sizing: border-box;
    display: flex;

    &__scrollable {
      flex: 1;
      overflow: overlay;
      display: flex;
      flex-direction: column;

      $scroll-size: $unnnic-inline-nano;

      padding-right: $unnnic-inline-xs + $scroll-size;
      margin-right: -($unnnic-inline-xs + $scroll-size);

      &::-webkit-scrollbar {
        width: $scroll-size;
      }

      &::-webkit-scrollbar-thumb {
        background: $unnnic-color-neutral-clean;
        border-radius: $unnnic-border-radius-pill;
      }

      &::-webkit-scrollbar-track {
        background: $unnnic-color-neutral-soft;
        border-radius: $unnnic-border-radius-pill;
      }
    }
  }
}
</style>
