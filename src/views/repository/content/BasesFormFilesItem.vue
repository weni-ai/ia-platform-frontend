<template>
  <div class="files-list__content__file">
    <div class="files-list__content__file__icon">
      <UnnnicIcon
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
      </div>
    </div>

    <div class="files-list__content__file__actions">
      <UnnnicIcon
        v-if="downloading"
        icon="cached"
        size="sm"
        scheme="neutral-cloudy"
        class="files-list__content__file__actions__loading"
      />

      <UnnnicIcon
        v-else-if="file.status === 'uploaded' && file.extension_file !== 'site'"
        icon="download"
        size="sm"
        class="files-list__content__file__actions__icon"
        @click.native="download"
      />

      <UnnnicIcon
        v-if="!file.uuid.startsWith('temp-')"
        icon="delete"
        size="sm"
        class="files-list__content__file__actions__icon"
        @click.native="$emit('remove')"
      />
    </div>

    <div
      v-if="file.status === 'uploading'"
      :class="['files-list__content__file__status-bar', file.extension_file]"
    >
      <div
        class="files-list__content__file__status-bar__filled"
        :style="{ width: `${file.progress * 100}%` }"
      ></div>
    </div>
  </div>
</template>

<script>
import nexusaiAPI from '../../../api/nexusaiAPI';

export default {
  props: {
    file: Object,
  },

  data() {
    return {
      downloading: false,
    };
  },

  computed: {
    fileHref() {
      return this.file?.file || '';
    },

    fileName() {
      if (this.file.extension_file === 'site') {
        return this.file?.created_file_name;
      }

      return `${this.file?.created_file_name || ''}.${
        this.file?.extension_file
      }`;
    },

    extension() {
      if (this.file.extension_file === 'site') {
        return this.file.extension_file;
      }

      return this.fileName.lastIndexOf('.') === -1
        ? this.fileName
        : this.fileName.slice(this.fileName.lastIndexOf('.') + 1);
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
          site: 'globe',
        }[this.extension] || 'draft'
      );
    },

    name() {
      const n = this.fileName.slice(0, -this.extension.length - 1);

      if (this.extension === 'site' && this.fileName.length > 23) {
        return this.fileName.slice(0, 15) + '...' + this.fileName.slice(-8);
      }

      return this.fileName.length > 15
        ? `${n.slice(0, 15)}....${this.extension}`
        : this.fileName;
    },
  },

  methods: {
    async download() {
      try {
        this.downloading = true;

        const { data } =
          await nexusaiAPI.intelligences.contentBases.files.download({
            file_name: this.file.file_name,
            fileUuid: this.file.uuid,
          });

        const a = document.createElement('a');

        a.setAttribute('download', this.fileName);
        a.setAttribute('href', data.file);

        a.click();
      } finally {
        this.downloading = false;
      }
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

  background-color: $unnnic-color-background-white;

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

    &__loading {
      user-select: none;

      animation: spinning 2s infinite ease;

      @keyframes spinning {
        0% {
          transform: rotate(0);
        }

        100% {
          transform: rotate(360deg);
        }
      }
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
      position: absolute;
      width: 0;
      height: $unnnic-border-width-thin;
      border-radius: $unnnic-border-radius-pill;
      background-color: $unnnic-color-weni-500;
      transition: width 100ms;
    }

    &.site &__filled {
      animation: loading-site 1s infinite;
    }

    @keyframes loading-site {
      0% {
        width: 0;
        left: 0;
      }

      50% {
        width: 50%;
        left: 25%;
      }

      100% {
        width: 0;
        left: 100%;
      }
    }
  }
}
</style>
