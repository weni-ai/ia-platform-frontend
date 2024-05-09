<template>
  <div class="import-and-export-intelligence">
    <h2 class="import-and-export-intelligence__title">
      {{ $t('webapp.import_and_export_intelligence.title') }}
    </h2>
    <p class="import-and-export-intelligence__description">
      {{ $t('webapp.import_and_export_intelligence.subtitle') }}
    </p>
    <div class="import-and-export-intelligence__buttons">
      <UnnnicButton
        ref="setVisibleImport"
        type="secondary"
        class="mr-4"
        @click.native="setVisibleImportModal()"
      >
        {{ $t('webapp.import_and_export_intelligence.import_rasa') }}
      </UnnnicButton>
      <UnnnicButton
        ref="setVisibleMigrate"
        type="secondary"
        @click.native="setVisibleMigrateModal()"
      >
        {{ $t('webapp.import_and_export_intelligence.migrate_wit') }}
      </UnnnicButton>
    </div>

    <UnnnicModal
      :text="
        importModalVisible
          ? $t('webapp.import_and_export_intelligence.import_rasa')
          : $t('webapp.import_and_export_intelligence.migrate_wit')
      "
      :showModal="openImportModal"
      @close="closeImportModal"
    >
      <div slot="message">
        <ImportRasaModal
          v-if="importModalVisible"
          @dispatchCloseModal="closeImportModal"
          @dispatchImportNotification="dispatchNotification($event)"
        />
        <ImportWitModal
          v-if="migrateModalVisible"
          @dispatchCloseModal="closeImportModal"
          @dispatchMigrateNotification="dispatchNotification($event)"
        />
      </div>
    </UnnnicModal>
  </div>
</template>

<script>
import ImportDataModal from '@/components/shared/ImportDataModal';
import MigrateIntelligenceModal from '@/components/shared/MigrateIntelligenceModal';
import ImportRasaModal from '@/components/shared/ImportRasaModal';
import ImportWitModal from '@/components/shared/ImportWitModal';

export default {
  name: 'ImportIntelligence',
  components: {
    ImportDataModal,
    MigrateIntelligenceModal,
    ImportRasaModal,
    ImportWitModal,
  },
  data() {
    return {
      intelligenceFile: null,
      importModalVisible: false,
      migrateModalVisible: false,
      openImportModal: false,
    };
  },
  methods: {
    importSelectedFile() {
      this.importModalVisible = false;
    },
    setVisibleImportModal() {
      this.importModalVisible = true;
      this.openImportModal = true;
    },
    closeImportModal() {
      this.importModalVisible = false;
      this.migrateModalVisible = false;
      this.openImportModal = false;
      this.intelligenceFile = null;
    },
    clearImportedFile() {
      this.$nextTick(() => {
        this.intelligenceFile = null;
      });
    },
    setVisibleMigrateModal() {
      this.migrateModalVisible = true;
      this.openImportModal = true;
    },
    closeMigrateModal() {
      this.migrateModalVisible = false;
    },
    dispatchNotification(value) {
      this.$buefy.toast.open({
        message: value.message,
        type: `${value.type}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';
@import '@/assets/scss/variables.scss';

.import-and-export-intelligence {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding-bottom: 3rem;
  width: 100%;

  &__title {
    color: #4e5666;
    margin-bottom: 1.5rem;
    font-family: Lato;
    font-size: 20px;
  }

  &__description {
    margin-bottom: 1.5rem;
    color: #4e5666;
    font-family: Lato;
    font-size: 14px;
  }

  &__description-train {
    text-align: justify;
    max-width: 80%;
  }

  &__buttons {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    &__import-button {
      width: 11.188rem;
      height: 2.5rem;
      color: $color-white;
      font-family: $font-family;
      box-shadow: 0px 3px 6px #00000029;
      border-radius: 6px;
      margin-right: 2rem;
    }

    &__input {
      width: 14rem;
      border: 1px solid $color-grey;
      border-radius: 4px;
    }
  }
  @media (max-width: $mobile-width) {
    width: 25rem;
  }
  :deep(.unnnic-modal-container-background-body-alert_icon) {
    display: none;
  }
  :deep(.unnnic-modal-container-background-body-description) {
    padding-bottom: 0;
  }
}
</style>
