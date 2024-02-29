<template>
  <div
    :class="[
      'files-area__container',
      {
        'files-area__container--flat-bottom': flatBottom,
        'files-area__container--active': files.data.length && isClientDragging
      },
    ]"
    @dragover.prevent
    @drop.prevent="drop"
  >
    <input
      v-show="false"
      ref="browser-file-input"
      type="file"
      multiple
      @change="drop"
    />

    <div class="files-area__scrollable">
      <div
        v-if="!files.data.length"
        :class="['paste-area', { 'paste-area--active': isClientDragging }]"
      >
        <section>
          <unnnic-intelligence-text
            tag="p"
            family="secondary"
            color="neutral-darkest"
            size="body-lg"
            weight="bold"
            margin-bottom="ant"
          >
            {{ $t('content_bases.files.upload_content') }}
          </unnnic-intelligence-text>

          <unnnic-intelligence-text
            tag="p"
            family="secondary"
            color="neutral-cloudy"
            size="body-gt"
          >
            <span v-html="$t('content_bases.files.supported_files')"></span>
          </unnnic-intelligence-text>
        </section>

        <unnnic-button
          @click="$refs['browser-file-input'].click()"
          size="small"
          type="primary"
          class="paste-area__button"
        >
          {{ $t('content_bases.files.browse_file') }}
        </unnnic-button>
      </div>

      <BasesFormGenericList
        v-else
        :title="$t('content_bases.files.uploaded_files')"
        :addText="$t('content_bases.files.browse_file')"
        :items.sync="files"
        @add="$refs['browser-file-input'].click()"
        @remove="
          ($event) =>
            openDeleteFileModal(
              $event.uuid,
              $event.created_file_name || '',
              $event.extension_file || '',
            )
        "
        @load-more="$emit('load-more')"
      />
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
import BasesFormGenericList from './BasesFormGenericList';

export default {
  components: {
    BasesFormFilesItem,
    BasesFormGenericList,
  },

  props: {
    flatBottom: Boolean,
    files: Object,
  },

  data() {
    return {
      alert: null,

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
  },

  beforeDestroy() {
    Object.keys(this.events).forEach((eventName) => {
      window.removeEventListener(eventName, this.events[eventName]);
    });

    clearTimeout(this.listOfFilesBeingProcessedTimeOut);
  },

  computed: {
    counter() {
      return this.files.next ? '10+' : this.files.data.length;
    },

    countUploading() {
      return this.files.data.filter(({ status }) => status === 'uploading')
        .length;
    },

    listOfFilesBeingProcessed() {
      return this.files.data.filter(({ status }) => status === 'processing');
    },
  },

  watch: {
    listOfFilesBeingProcessed: {
      deep: true,
      immediate: true,

      handler() {
        if (this.listOfFilesBeingProcessed.length) {
          this.listOfFilesBeingProcessedTimeOut = setTimeout(
            this.waitTillURLBeCreated,
            6000,
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
        created_file_name:
          extension !== file.name
            ? file.name.slice(0, -extension.length - 1)
            : file.name,
        extension_file: extension,
        status: 'waiting',
        progress: 0,
        file_name: null,
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

          if (data.created_file_name) {
            fileItem.created_file_name = data.created_file_name;
          }

          if (data.status === 'success') {
            fileItem.status = 'uploaded';
            fileItem.file_name = data.file_name;
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
          if (data.status === 'success') {
            fileItem.status = 'uploaded';
            fileItem.file_name = data.file_name;
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

    openDeleteFileModal(fileUuid, createdFileName, extensionFile) {
      const name = `${createdFileName || ''}.${extensionFile}`;

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

    &--active {
      outline-color: $unnnic-color-weni-500;
      background-color: $unnnic-color-weni-50;
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
  row-gap: $unnnic-spacing-sm;

  flex: none;

  &--active {
    background-color: $unnnic-color-weni-50;
    outline-color: $unnnic-color-weni-500;
  }

  &:only-child {
    flex: 1;
  }

  &__button {
    width: 12.5 * $unnnic-font-size;
    margin: 0 auto;
  }
}
</style>
