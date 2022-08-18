<template>
    <unnnic-modal-upload
      v-model="selectedFile"
      :textCancel="$t('webapp.import_dataset.cancel')"
      textTitle=""
      :textAction="$t('webapp.import_dataset.importar')"
      supportedFormats="txt,JSON"
      @action="dispatchUploadFile()"
      @cancel="removeFile()"
    />
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'ImportRasaModal',
  props: {
    isModalVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selectedFile: [],
    };
  },
  computed: {
    ...mapGetters([
      'getCurrentRepository',
    ]),
  },
  methods: {
    ...mapActions([
      'setUploadRasaDataset',
    ]),
    async dispatchUploadFile() {
      try {
        this.isButtonLoading = true;
        const formData = new FormData();
        formData.append('file', this.selectedFile[0]);
        formData.append('language', this.getCurrentRepository.language);

        await this.setUploadRasaDataset({
          repositoryVersion: this.getCurrentRepository.repository_version_id,
          repositoryUUID: this.getCurrentRepository.uuid,
          formData,
        });
        this.$emit('dispatchImportNotification', {
          type: 'success',
          title: this.$t('webapp.import_dataset.import_sentences_success_title'),
          message: this.$t('webapp.import_dataset.import_sentences_success_message')
        });
        this.dispatchCloseImportModal();
      } catch (error) {
        this.$emit('dispatchImportNotification', {
          type: 'error',
          title: this.$t('webapp.import_dataset.import_sentences_error_title'),
          message: this.$t('webapp.import_dataset.import_sentences_error_message')
        });
      } finally {
        this.isButtonLoading = false;
      }
    },
    dispatchCloseImportModal() {
      this.selectedFile = [];
      this.$emit('dispatchCloseModal');
    },
    removeFile() {
      this.selectedFile = []
    }
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';

.modal-card-foot {
  background: #f9f9f9;
}
.modal-upload {
  padding: 0;
  background: transparent;
  box-shadow: none;
  /deep/ .close-button-container {
    display: none;
  }
}
</style>
