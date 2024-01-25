<template>
  <div
    :class="[
      'files-area__container',
      { 'files-area__container--flat-bottom': flatBottom },
    ]"
  >
    <div class="files-area__scrollable">
      <div
        :class="['paste-area', { 'paste-area--active': isClientDragging }]"
        @dragover.prevent
        @drop.prevent="drop"
      >
        <div class="paste-area__title">
          {{ $t('content_bases.files.upload_content') }}
        </div>

        <div class="paste-area__content">
          {{ $t('content_bases.files.drag_and_drop_your_file_here') }}

          <small v-html="$t('content_bases.files.supported_files')"></small>
        </div>

        <input
          v-show="false"
          ref="browser-file-input"
          type="file"
          multiple
          @change="drop"
        />

        <unnnic-button
          @click="$refs['browser-file-input'].click()"
          size="small"
          type="primary"
          class="paste-area__button"
        >
          {{ $t('content_bases.files.browse_file') }}
        </unnnic-button>
      </div>

      <div v-if="files.data.length" class="files-list__container">
        <div class="files-list__header">
          {{ $t('content_bases.files.uploaded_files') }}
        </div>

        <div class="files-list__content">
          <bases-form-files-item
            v-for="file in files.data"
            :key="file.uuid"
            :file="file"
            @remove="openDeleteFileModal(file.uuid, file.file || '')"
          />

          <template v-if="files.status === 'loading'">
            <unnnic-skeleton-loading
              v-for="i in 3"
              :key="i"
              tag="div"
              height="56px"
            />
          </template>

          <div
            v-show="!['loading', 'complete'].includes(files.status)"
            ref="end-of-list-element"
          ></div>
        </div>
      </div>
    </div>

    <unnnic-alert
      :style="{ zIndex: 1 }"
      v-if="alert"
      :key="alert.text"
      @close="alert = null"
      :type="alert.type"
      :text="alert.text"
    ></unnnic-alert>

    <unnnic-modal
      v-if="modalDeleteFile"
      :text="$t('content_bases.files.delete_file.title')"
      :close-icon="false"
      class="delete-file-modal"
      persistent
    >
      <unnnic-icon slot="icon" icon="error" size="md" scheme="aux-red-500" />

      <div
        slot="message"
        v-html="
          $t('content_bases.files.delete_file.description', {
            name: modalDeleteFile.name,
          })
        "
      ></div>

      <unnnic-button
        slot="options"
        class="create-repository__container__button"
        type="tertiary"
        @click="modalDeleteFile = false"
      >
        {{ $t('content_bases.files.delete_file.cancel') }}
      </unnnic-button>

      <unnnic-button
        slot="options"
        class="create-repository__container__button attention-button"
        type="warning"
        @click="remove"
        :loading="modalDeleteFile.status === 'deleting'"
      >
        {{ $t('content_bases.files.delete_file.delete') }}
      </unnnic-button>
    </unnnic-modal>
  </div>
</template>

<script>
import nexusaiAPI from '../../../api/nexusaiAPI';
import { get } from 'lodash';
import BasesFormFilesItem from './BasesFormFilesItem';

export default {
  components: { BasesFormFilesItem },

  props: {
    flatBottom: Boolean,
    files: Object,
  },

  data() {
    return {
      alert: null,

      isShowingEndOfList: false,
      intersectionObserver: null,

      isClientDragging: false,
      leave: null,

      modalDeleteFile: null,

      filesBeingProcessedIndex: 0,
      listOfFilesBeingProcessedTimeOut: null,

      events: {
        dragover: (event) => {
          event.preventDefault();

          clearTimeout(this.leave);

          this.isClientDragging = true;
        },

        dragleave: () => {
          clearTimeout(this.leave);

          this.leave = setTimeout(() => {
            this.isClientDragging = false;
          }, 100);
        },

        drop: () => {
          this.isClientDragging = false;
        },
      },
    };
  },

  mounted() {
    Object.keys(this.events).forEach((eventName) => {
      window.addEventListener(eventName, this.events[eventName]);
    });

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isShowingEndOfList = entry.isIntersecting;
      });
    });

    this.intersectionObserver.observe(this.$refs['end-of-list-element']);
  },

  beforeDestroy() {
    Object.keys(this.events).forEach((eventName) => {
      window.removeEventListener(eventName, this.events[eventName]);
    });

    this.intersectionObserver.unobserve(this.$refs['end-of-list-element']);

    clearTimeout(this.listOfFilesBeingProcessedTimeOut);
  },

  computed: {
    countUploading() {
      return this.files.data.filter(({ status }) => status === 'uploading')
        .length;
    },

    listOfFilesBeingProcessed() {
      return this.files.data.filter(({ status }) => status === 'processing');
    },
  },

  watch: {
    isShowingEndOfList() {
      if (this.isShowingEndOfList && this.files.status === null) {
        this.$emit('load-more');
      }
    },

    listOfFilesBeingProcessed: {
      deep: true,
      immediate: true,

      handler() {
        if (this.listOfFilesBeingProcessed.length) {
          this.listOfFilesBeingProcessedTimeOut = setTimeout(
            this.waitTillURLBeCreated,
            6000
          );
        }
      },
    },

    countUploading(currentValue, pastValue) {
      if (this.countUploading === 0) {
        this.alert = {
          type: 'success',
          text: this.$t(
            'content_bases.files.content_of_the_files_has_been_added',
          ),
        };
      }

      if (currentValue > pastValue) {
        this.alert = {
          type: 'default',
          text: this.$t('content_bases.files.content_of_the_files_is_loading'),
        };
      }
    },
  },

  methods: {
    drop(event) {
      const files = get(event, 'dataTransfer.files') || get(event, 'srcElement.files');

      if (!get(files, 'length', 0)) {
        return;
      }

      files.forEach(this.addFile);
    },

    updateFileItem(uuid, key, value) {
      this.$emit('update:files', {
        ...this.files,
        data: this.files.data.map((file) => {
          if (file.uuid !== uuid) {
            return file;
          }

          return {
            ...file,
            key: value,
          };
        }),
      });
    },

    addFile(file) {
      const extension = file.name.lastIndexOf('.') === -1
        ? file.name
        : file.name.slice(file.name.lastIndexOf('.') + 1);

      const fileItem = {
        uuid: `temp-${Math.floor(Math.random() * 1e9)}`,
        file: file.name,
        extension_file: extension,
        status: 'waiting',
        progress: 0,
      };

      this.files.data.push(fileItem);

      fileItem.status = 'uploading';

      nexusaiAPI.intelligences.contentBases.files
        .create({
          contentBaseUuid: this.$route.params.contentBaseUuid,
          file,
          extension_file: extension,

          onUploadProgress: (event) => {
            fileItem.progress = event.loaded / event.total;
          },
        })
        .then(({ data }) => {
          fileItem.uuid = data.uuid;
          fileItem.extension_file = data.extension_file;

          if (data.file) {
            fileItem.status = 'uploaded';
            fileItem.file = data.file;
          } else {
            fileItem.status = 'processing';
          }
        });
    },

    waitTillURLBeCreated() {
      if (this.listOfFilesBeingProcessed.length === 0) {
        return;
      }

      const fileItem = this.listOfFilesBeingProcessed[
        this.filesBeingProcessedIndex % this.listOfFilesBeingProcessed.length
      ];

      nexusaiAPI.intelligences.contentBases.files
        .read({
          contentBaseUuid: this.$route.params.contentBaseUuid,
          fileUuid: fileItem.uuid,
        })
        .then(({ data }) => {
          if (data.file) {
            fileItem.status = 'uploaded';
            fileItem.file = data.file;
          } else {
            this.filesBeingProcessedIndex += 1;
          }

          if (this.listOfFilesBeingProcessed.length) {
            this.listOfFilesBeingProcessedTimeOut = setTimeout(
              this.waitTillURLBeCreated,
              6000,
            );
          }
        });
    },

    openDeleteFileModal(fileUuid, fileName) {
      const name = fileName.lastIndexOf('/') === -1
        ? fileName
        : fileName.slice(fileName.lastIndexOf('/') + 1);

      this.modalDeleteFile = {
        uuid: fileUuid,
        name,
        status: null,
      };
    },

    remove() {
      this.modalDeleteFile.status = 'deleting';

      nexusaiAPI.intelligences.contentBases.files
        .delete({
          contentBaseUuid: this.$route.params.contentBaseUuid,
          fileUuid: this.modalDeleteFile.uuid,
        })
        .then(() => {
          this.alert = {
            type: 'default',
            text: this.$t('content_bases.files.file_removed_from_base', {
              name: this.modalDeleteFile.name,
            }),
          };

          this.$emit('removed', this.modalDeleteFile.uuid);

          this.modalDeleteFile = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.delete-file-modal ::v-deep {
  .unnnic-modal-container-background-body-description-container {
    padding-bottom: $unnnic-spacing-xs;
  }

  .unnnic-modal-container-background-body__icon-slot {
    display: flex;
    justify-content: center;
    margin-bottom: $unnnic-spacing-sm;
  }

  .unnnic-modal-container-background-body-title {
    padding-bottom: $unnnic-spacing-sm;
  }

  .unnnic-modal-container-background-body {
    padding-top: $unnnic-spacing-giant;
  }
}

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

  &--active {
    background-color: $unnnic-color-weni-50;
    outline-color: $unnnic-color-weni-500;
  }

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
