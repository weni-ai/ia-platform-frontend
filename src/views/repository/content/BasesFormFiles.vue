<template>
  <div
    :class="[
      'files-area__container',
      `files-area__container--shape-${shape}`,
      {
        'files-area__container--active': files.data.length && isClientDragging,
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

    <div
      v-if="!files.data.length && shape !== 'accordion'"
      :class="['paste-area', { 'paste-area--active': isClientDragging }]"
    >
      <section>
        <UnnnicIntelligenceText
          tag="p"
          family="secondary"
          color="neutral-darkest"
          size="body-lg"
          weight="bold"
          marginBottom="ant"
        >
          {{ $t('content_bases.files.upload_content') }}
        </UnnnicIntelligenceText>

        <UnnnicIntelligenceText
          tag="p"
          family="secondary"
          color="neutral-cloudy"
          size="body-gt"
        >
          <span v-html="$t('content_bases.files.supported_files')"></span>
        </UnnnicIntelligenceText>
      </section>

      <UnnnicButton
        @click="$refs['browser-file-input'].click()"
        size="small"
        type="primary"
        class="paste-area__button"
      >
        {{ $t('content_bases.files.browse_file') }}
      </UnnnicButton>
    </div>

    <BasesFormGenericList
      v-else
      :shape="shape"
      :title="
        shape === 'accordion'
          ? $t('content_bases.tabs.files')
          : $t('content_bases.files.uploaded_files')
      "
      :description="removeHTML($t('content_bases.files.supported_files'))"
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

    <UnnnicAlert
      :style="{ zIndex: 1 }"
      v-if="alert"
      :key="alert.text"
      @close="alert = null"
      :type="alert.type"
      :text="alert.text"
    ></UnnnicAlert>

    <UnnnicModal
      v-if="modalDeleteFile"
      :text="$t('content_bases.files.delete_file.title')"
      :closeIcon="false"
      class="delete-file-modal"
      persistent
    >
      <UnnnicIcon
        slot="icon"
        icon="error"
        size="md"
        scheme="aux-red-500"
      />

      <div
        slot="message"
        v-html="
          $t('content_bases.files.delete_file.description', {
            name: modalDeleteFile.name,
          })
        "
      ></div>

      <UnnnicButton
        slot="options"
        class="create-repository__container__button"
        type="tertiary"
        @click="modalDeleteFile = false"
      >
        {{ $t('content_bases.files.delete_file.cancel') }}
      </UnnnicButton>

      <UnnnicButton
        slot="options"
        class="create-repository__container__button attention-button"
        type="warning"
        @click="remove"
        :loading="modalDeleteFile.status === 'deleting'"
      >
        {{ $t('content_bases.files.delete_file.delete') }}
      </UnnnicButton>
    </UnnnicModal>
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
    files: Object,
    shape: String,
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
    contentBaseUuid() {
      return (
        this.$route.params.contentBaseUuid ||
        this.$store.state.router.contentBaseUuid
      );
    },

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
    removeHTML(string) {
      const span = document.createElement('span');
      span.innerHTML = string;
      return span.textContent;
    },

    drop(event) {
      const files =
        get(event, 'dataTransfer.files') || get(event, 'srcElement.files');

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
      const extension =
        file.name.lastIndexOf('.') === -1
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
        file_name: file.name,
      };

      this.files.data.push(fileItem);

      fileItem.status = 'uploading';

      nexusaiAPI.intelligences.contentBases.files
        .create({
          contentBaseUuid: this.contentBaseUuid,
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

          this.updateFileItem(data.uuid, undefined, 'uploaded');
        });
    },

    waitTillURLBeCreated() {
      if (this.listOfFilesBeingProcessed.length === 0) {
        return;
      }

      const fileItem =
        this.listOfFilesBeingProcessed[
          this.filesBeingProcessedIndex % this.listOfFilesBeingProcessed.length
        ];

      nexusaiAPI.intelligences.contentBases.files
        .read({
          contentBaseUuid: this.contentBaseUuid,
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
          contentBaseUuid: this.contentBaseUuid,
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
    flex: 1;
    display: flex;
    flex-direction: column;

    &--active {
      outline-color: $unnnic-color-weni-500;
      background-color: $unnnic-color-weni-50;
    }

    &--shape-normal {
      height: 100%;
    }

    &--shape-accordion {
      flex: initial;
    }
  }
}

.paste-area {
  height: 100%;

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
