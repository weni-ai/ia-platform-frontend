<template>
  <div
    :class="[
      'files-list__content__file',
      {
        'files-list__content__file--loaded': file.status === 'uploaded',
      },
    ]"
  >
    <div class="files-list__content__file__icon">
      <unnnic-icon
        :icon="icon"
        class="files-list__content__file__icon__itself"
        size="avatar-nano"
      />
    </div>

    <div class="files-list__content__file__content">
      <div class="files-list__content__file__content__title">
        {{ name }}
      </div>

      <div class="files-list__content__file__content__status">

        <template v-if="file.status === 'uploading'">
          {{ $t('content_bases.files.status.uploading') }}
        </template>

        <template v-else-if="file.status === 'uploaded'">
          {{ $t('content_bases.files.status.uploaded') }}
        </template>
      </div>
    </div>

    <div
      v-if="file.status === 'uploaded'"
      class="files-list__content__file__actions"
    >
      <unnnic-icon
        v-if="file.file.startsWith('https:')"
        icon="download"
        size="sm"
        class="files-list__content__file__actions__icon"
        @click.native="download"
      />

      <unnnic-icon
        v-if="file.file.startsWith('https:')"
        icon="delete"
        size="sm"
        class="files-list__content__file__actions__icon"
        @click.native="$emit('remove')"
      />
    </div>

    <div
      v-if="file.status === 'uploading'"
      class="files-list__content__file__status-bar"
    >
      <div
        class="files-list__content__file__status-bar__filled"
        :style="{ width: `${file.progress * 100}%` }"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    file: Object,
  },

  computed: {
    extension() {
      return this.file.file.lastIndexOf('.') === -1
        ? this.file.file
        : this.file.file.slice(this.file.file.lastIndexOf('.') + 1);
    },

    icon() {
      return (
        {
          pdf: 'picture_as_pdf',
          txt: 'text_snippet',
          xls: 'table',
          xlsx: 'table',
          doc: 'draft',
          docx: 'draft',
        }[this.extension] || 'draft'
      );
    },

    name() {
      const name = this.file.file.lastIndexOf('/') === -1
        ? this.file.file
        : this.file.file.slice(this.file.file.lastIndexOf('/') + 1);

      const n = name.slice(0, -this.extension.length - 1);

      return name.length > 15 ? `${n.slice(0, 15)}....${this.extension}` : name;
    },
  },

  methods: {
    download() {
      const a = document.createElement('a');

      a.setAttribute('download', this.name);
      a.setAttribute('href', this.file.file);

      a.click();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.files-list__content__file {
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
      transition: width 100ms;
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
</style>
