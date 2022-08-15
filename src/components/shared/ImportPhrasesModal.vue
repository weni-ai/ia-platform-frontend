<template>
  <unnnic-modal :text="$t('webapp.translate.import_title')" :showModal="open" @close="closeModal">
    <div slot="message">
      <unnnic-tab initialTab="first" :tabs="tabs">
        <template slot="tab-head-first">
          {{ $t("webapp.import_and_export_intelligence.import_rasa") }}
        </template>
        <template slot="tab-panel-first">
          <ImportDataModal
            @dispatchImportNotification="dispatchNotification($event)"
          />
        </template>
        <template slot="tab-head-second">
          {{ $t("webapp.import_and_export_intelligence.migrate_wit") }}
        </template>
        <template slot="tab-panel-second">
          <MigrateIntelligenceModal />
        </template>
      </unnnic-tab>
    </div>
  </unnnic-modal>
</template>

<script>
import ImportDataModal from '@/components/shared/ImportDataModal';
import MigrateIntelligenceModal from '@/components/shared/MigrateIntelligenceModal';

export default {
  name: 'ImportPhrasesModal',
  components: {
    ImportDataModal,
    MigrateIntelligenceModal
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
      this.$buefy.toast.open({
        message: value.message,
        type: `${value.type}`,
      });
    },
  }
};
</script>

<style>
</style>
