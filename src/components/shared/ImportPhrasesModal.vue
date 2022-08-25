<template>
  <unnnic-modal :text="$t('webapp.translate.import_title')" :showModal="open" @close="closeModal">
    <div slot="message">
      <unnnic-tab initialTab="first" :tabs="tabs">
        <template slot="tab-head-first">
          {{ $t("webapp.import_and_export_intelligence.import_rasa") }}
        </template>
        <template slot="tab-panel-first">
          <import-rasa-modal
            @dispatchImportNotification="dispatchNotification"
            @dispatchCloseModal="closeModal"
          />
        </template>
        <template slot="tab-head-second">
          {{ $t("webapp.import_and_export_intelligence.migrate_wit") }}
        </template>
        <template slot="tab-panel-second">
          <import-wit-modal
            @dispatchCloseModal="closeModal"
            @dispatchMigrateNotification="dispatchNotification"
          />
        </template>
      </unnnic-tab>
    </div>
  </unnnic-modal>
</template>

<script>
import ImportRasaModal from '@/components/shared/ImportRasaModal';
import ImportWitModal from '@/components/shared/ImportWitModal';

export default {
  name: 'ImportPhrasesModal',
  components: {
    ImportRasaModal,
    ImportWitModal
  },
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    closeModal: {
      type: Function
    }
  },
  data() {
    return {
      tabs: ['first', 'second'],
    };
  },
  methods: {
    dispatchNotification(value) {
      this.$emit('dispatchImportNotification', value);
    },
  }
};
</script>

<style lang="scss" scoped>

/deep/ .unnnic-modal-container-background {
  min-height: 420px;
}

</style>
