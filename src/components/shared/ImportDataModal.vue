<template>
  <div class="import-data-modal">
    <BModal
      :active.sync="isModalVisible"
      :destroyOnHide="false"
      :canCancel="false"
      hasModalCard
      aria-role="dialog"
      class="import-data-modal__card"
      aria-modal
    >
      <div class="modal-card import-data-modal__modal-style">
        <header class="modal-card-head import-data-modal__modal-style__header">
          <p>{{ $t('webapp.import_dataset.title') }}</p>
        </header>
        <section class="modal-card-body">
          <BField class="import-data-modal__custom-file-upload">
            <div class="import-data-modal__custom-file-upload__input">
              <BUpload v-model="selectedFile">
                <a
                  class="button import-data-modal__custom-file-upload__input__button"
                >
                  <BIcon
                    icon="upload"
                    type="is-white"
                  />
                </a>
              </BUpload>
              <div
                v-if="selectedFile"
                class="import-data-modal__custom-file-upload__input__file"
              >
                {{ selectedFile.name }}
                <div
                  class="import-data-modal__custom-file-upload__input__icon"
                  @click="removeSelectedFile"
                >
                  <BIcon
                    icon="close-circle"
                    customSize="mdi-18px"
                  />
                </div>
              </div>
              <div
                v-else
                class="import-data-modal__custom-file-upload__input__file"
              >
                <span>{{ $t('webapp.import_dataset.empty_file') }}</span>
              </div>
            </div>
          </BField>
        </section>
        <footer class="modal-card-foot">
          <div class="import-data-modal__modal-style__style-button">
            <BButton
              class="modal-button"
              type="is-white"
              @click="dispatchCloseImportModal()"
            >
              {{ $t('webapp.import_dataset.cancel') }}
            </BButton>
            <BButton
              :loading="isButtonLoading"
              :disabled="selectedFile === null"
              class="modal-button"
              type="is-primary"
              @click="dispatchUploadFile()"
            >
              {{ $t('webapp.import_dataset.importar') }}
            </BButton>
          </div>
        </footer>
      </div>
    </BModal>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'ImportDataModal',
  props: {
    isModalVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selectedFile: null,
      isButtonLoading: false,
    };
  },
  computed: {
    ...mapGetters(['getCurrentRepository']),
  },
  methods: {
    ...mapActions(['setUploadRasaDataset']),
    removeSelectedFile() {
      this.selectedFile = null;
    },
    async dispatchUploadFile() {
      try {
        this.isButtonLoading = true;
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('language', this.getCurrentRepository.language);

        await this.setUploadRasaDataset({
          repositoryVersion: this.getCurrentRepository.repository_version_id,
          repositoryUUID: this.getCurrentRepository.uuid,
          formData,
        });
        this.$emit('dispatchImportNotification', {
          type: 'is-success',
          message: this.$t('webapp.import_dataset.import_success'),
        });
        this.dispatchCloseImportModal();
      } catch (error) {
        this.$emit('dispatchImportNotification', {
          type: 'is-danger',
          message: this.$t('webapp.import_dataset.import_error'),
        });
      } finally {
        this.isButtonLoading = false;
      }
    },
    dispatchCloseImportModal() {
      this.selectedFile = null;
      this.$emit('dispatchCloseModal');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';

.import-data-modal {
  &__modal-style {
    width: 26.5rem;
    @media (max-width: $mobile-width) {
      padding-left: 5rem;
    }
    &__header {
      p {
        font-size: 1.5rem;
      }
    }

    &__style-button {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      align-items: center;

      .modal-button {
        cursor: pointer;
        border: 1px solid #dbdbdb;
        text-align: center;
        border-radius: 4px;
        font-family: $font-family;
        box-shadow: none;

        &:hover {
          border: 1px solid #c2c2c2;
        }
      }
    }
  }
  &__custom-file-upload {
    display: flex;
    flex-direction: column;

    &__input {
      display: flex;
      width: 100%;

      &__button {
        background-color: #9e9e9e;
        padding: 0 2rem;
      }

      &__file {
        border: 1px solid #d5d5d5;
        color: #bababa;
        font-size: $font-size;
        font-family: $font-family;
        display: flex;
        width: 100%;
        justify-content: center;
        align-items: center;
        border-top-right-radius: 0.4rem;
        border-bottom-right-radius: 0.4rem;

        span {
          font-size: 1rem;
        }
      }
      &__icon {
        cursor: pointer;
        color: #d5d5d5;
        display: flex;
        align-items: center;
        &:hover {
          color: $color-grey-dark;
        }
      }
    }
  }
}
</style>
