<template>
  <div
    :class="[
      'files-area__container',
      { 'files-area__container--flat-bottom': flatBottom },
    ]"
  >
    <div class="files-area__scrollable">
      <div :class="['paste-area']">
        <div class="paste-area__title">
          {{ $t('content_bases.files.upload_content') }}
        </div>

        <div class="paste-area__content">
          {{ $t('content_bases.files.drag_and_drop_your_file_here') }}

          <small v-html="$t('content_bases.files.supported_files')"></small>
        </div>

        <unnnic-button size="small" type="primary" class="paste-area__button">
          {{ $t('content_bases.files.browse_file') }}
        </unnnic-button>
      </div>

      <div v-if="true" class="files-list__container">
        <div class="files-list__header">
          {{ $t('content_bases.files.uploaded_files') }}
        </div>

        <div class="files-list__content">
          <div
            v-for="i in 100"
            :key="i"
            :class="[
              'files-list__content__file',
              { 'files-list__content__file--loaded': true },
            ]"
          >
            <div class="files-list__content__file__icon">
              <unnnic-icon
                icon="picture_as_pdf"
                class="files-list__content__file__icon__itself"
                size="avatar-nano"
              />
            </div>

            <div class="files-list__content__file__content">
              <div class="files-list__content__file__content__title">
                lhamas.pdf fds fs fds fds fsdf s
              </div>

              <div class="files-list__content__file__content__status">
                Conteúdo carregado
              </div>
            </div>

            <div class="files-list__content__file__actions">
              <unnnic-icon
                icon="download"
                size="sm"
                class="files-list__content__file__actions__icon"
              />

              <unnnic-icon
                icon="delete"
                size="sm"
                class="files-list__content__file__actions__icon"
              />
            </div>

            <div class="files-list__content__file__status-bar">
              <div class="files-list__content__file__status-bar__filled"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    flatBottom: Boolean,
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.files-list {
  &__container {
    height: 0;
    margin-top: $unnnic-spacing-md;
  }

  &__header {
    margin-bottom: $unnnic-spacing-ant;

    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-bold;
  }

  &__content {
    display: grid;
    gap: $unnnic-spacing-xs;
    grid-template-columns: repeat(
      auto-fill,
      minmax(16 * $unnnic-font-size, 1fr)
    );

    &__file {
      outline-style: solid;
      outline-color: $unnnic-color-neutral-soft;
      outline-width: $unnnic-border-width-thinner;
      outline-offset: -$unnnic-border-width-thinner;

      border-radius: $unnnic-border-radius-sm;

      padding: $unnnic-spacing-xs;
      display: flex;
      column-gap: $unnnic-spacing-ant;
      align-items: center;
      position: relative;

      &__icon {
        display: flex;
        background-color: $unnnic-color-neutral-light;
        border-radius: $unnnic-border-radius-sm;
        padding: 0.6875 * $unnnic-font-size;

        &__itself {
          color: $unnnic-color-neutral-clean;
        }
      }

      &__content {
        display: flex;
        flex-direction: column;

        &__title {
          color: $unnnic-color-neutral-dark;
          font-family: $unnnic-font-family-secondary;
          font-size: $unnnic-font-size-body-gt;
          line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
          font-weight: $unnnic-font-weight-regular;
        }

        &__status {
          color: $unnnic-color-neutral-clean;
          font-family: $unnnic-font-family-secondary;
          font-size: $unnnic-font-size-body-md;
          line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
          font-weight: $unnnic-font-weight-regular;
        }
      }

      &__actions {
        display: flex;
        column-gap: $unnnic-spacing-xs;
        margin-left: auto;
        margin-right: $unnnic-spacing-xs;

        &__icon {
          cursor: pointer;
          color: $unnnic-color-neutral-cloudy;
          user-select: none;
        }
      }

      &__status-bar {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: $unnnic-border-width-thin;
        background-color: $unnnic-color-weni-100;
        border-radius: $unnnic-border-radius-pill;

        &__filled {
          width: 0;
          height: $unnnic-border-width-thin;
          border-radius: $unnnic-border-radius-pill;
          background-color: $unnnic-color-weni-500;
        }
      }

      &--loaded {
        .files-list__content__file__icon {
          background-color: $unnnic-color-weni-50;
          &__itself {
            color: $unnnic-color-weni-600;
          }
        }
      }
    }
  }
}

.files-area {
  &__container {
    outline-style: solid;
    outline-color: $unnnic-color-neutral-cleanest;
    outline-width: $unnnic-border-width-thinner;
    outline-offset: -$unnnic-border-width-thinner;

    border-radius: $unnnic-border-radius-sm;
    padding: $unnnic-spacing-sm;

    flex: 1;
    display: flex;
    flex-direction: column;

    &--flat-bottom {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
  }

  &__scrollable {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
    height: 100%;

    overflow: overlay;

    $scroll-size: $unnnic-inline-nano;

    padding-right: $unnnic-inline-nano + $scroll-size;
    margin-right: -($unnnic-inline-nano + $scroll-size);

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

.paste-area {
  justify-content: center;
  outline-style: dashed;
  outline-color: $unnnic-color-neutral-cleanest;
  outline-width: $unnnic-border-width-thinner;
  outline-offset: -$unnnic-border-width-thinner;

  border-radius: $unnnic-border-radius-md;
  padding: $unnnic-spacing-xl $unnnic-spacing-sm;

  text-align: center;

  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-ant;

  flex: none;

  &:only-child {
    flex: 1;
  }

  &__title {
    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-lg;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-bold;
  }

  &__content {
    color: $unnnic-color-neutral-dark;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-regular;

    display: flex;
    flex-direction: column;
    row-gap: $unnnic-spacing-xs;

    small {
      color: $unnnic-color-neutral-cloudy;
      font-size: $unnnic-font-size-body-md;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
    }
  }

  &__button {
    width: 10.625 * $unnnic-font-size;
    margin: 0 auto;
  }
}
</style>
