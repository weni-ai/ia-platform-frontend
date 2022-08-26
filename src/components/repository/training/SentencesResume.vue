<template>
  <div class="sentences-resume">
    <h1 class="sentences-resume__title">
      {{$t('webapp.resumeSentences.title')}}
    </h1>
    <p class="sentences-resume__description">
      {{$t('webapp.resumeSentences.description')}}
    </p>
    <div class="sentences-resume__wrapper">
      <div class="sentences-resume__wrapper-cards">
        <NumbersCard
          :label="$t('webapp.resumeSentences.sentences')"
          :count="stats.count"
        />
        <NumbersCard
          :label="$t('webapp.resumeSentences.intentions')"
          :count="stats.intents"
        />
        <NumbersCard
          :label="$t('webapp.resumeSentences.entities')"
          :count="stats.entities"
        />
        <NumbersCard
          :label="$t('webapp.resumeSentences.languages')"
          :count="stats.languages"
        />
      </div>

      <div class="sentences-resume__wrapper-buttons">
        <unnnic-button
          type="secondary"
          size="large"
          :disabled="buttonDisabled"
          :loading="buttonLoading"
          @click="train()"
        >
          {{ $t("webapp.trainings.run_training") }}
        </unnnic-button>
        <unnnic-button
          type="terciary"
          size="large"
          @click.native="setVisibleImportModal()"
        >
          {{ $t("webapp.translate.import_title") }}
        </unnnic-button>
      </div>
    </div>


    <ImportPhrasesModal
      class="import-modal"
      :open="importModalVisible"
      :closeModal="closeImportModal"
      @dispatchImportNotification="dispatchNotification"
      @dispatchMigrateNotification="dispatchNotification"
    />

    <unnnic-modal
      :showModal="openNotificationModal"
      :text="notificationModalTitle"
      :scheme="notificationModalType === 'success' ? 'feedback-green' : 'feedback-red'"
      :modal-icon="notificationModalType === 'success' ? 'check-circle-1-1' : 'alert-circle-1'"
      @close="onCloseNotification"
    >
      <span
      slot="message"
      v-html="notificationModalMessage" />
    </unnnic-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import SummaryInformation from '@/components/repository/SummaryInformation';
import NumbersCard from '@/components/shared/NumbersCard';
import ImportDataModal from '@/components/shared/ImportDataModal';
import MigrateIntelligenceModal from '@/components/shared/MigrateIntelligenceModal';
import ImportPhrasesModal from '@/components/shared/ImportPhrasesModal';

export default {
  name: 'SentencesResume',
  components: {
    SummaryInformation,
    NumbersCard,
    ImportDataModal,
    MigrateIntelligenceModal,
    ImportPhrasesModal,
  },
  computed: {
    ...mapGetters(['getCurrentRepository']),
    stats() {
      if (this.examplesList) {
        return {
          count: this.examplesList.total,
          intents: this.filterIntents(),
          entities: this.filterEntities(),
          languages: this.filterLanguages(),
        }
      }
      return {
        count: 0,
        intents: 0,
        entities: 0,
        languages: 0
      }
    }
  },
  props: {
    buttonDisabled: {
      type: Boolean,
    },
    buttonLoading: {
      type: Boolean,
    },
    buttonClass: {
      type: String,
    },
    buttonClick: {
      type: Function,
    },
    examplesList: {
      type: Object,
    }
  },
  data() {
    return {
      intelligenceFile: null,
      importModalVisible: false,
      migrateModalVisible: false,
      openNotificationModal: false,
      notificationModalType: '',
      notificationModalTitle: '',
      notificationModalMessage: ''
    };
  },
  methods: {
    async train(){
      await this.buttonClick();
    },
    importSelectedFile() {
      this.importModalVisible = false;
    },
    setVisibleImportModal() {
      this.importModalVisible = true;
    },
    closeImportModal() {
      this.importModalVisible = false;
      this.intelligenceFile = null;
    },
    clearImportedFile() {
      this.$nextTick(() => {
        this.intelligenceFile = null;
      });
    },
    dispatchNotification(value) {
      this.openNotificationModal = true
      this.notificationModalType = value.type
      this.notificationModalTitle = value.title
      this.notificationModalMessage = value.message
    },
    onCloseNotification() {
      this.openNotificationModal = false
      if (this.notificationModalType === 'success') this.$emit('onImportSuccess')
    },
    filterIntents() {
      const intents = this.examplesList.items.map(el => el.intent)
      const result = intents.sort().reduce((init, current) => {
        if (init.length === 0 || init[init.length - 1] !== current) {
          init.push(current);
        }
        return init;
      }, []);
      return result.length
    },
    filterEntities() {
      const entities = this.examplesList.items
        .reduce((prev, curr) => [...prev, ...curr.entities], [])
        .map(el => el.entity)
        .sort().reduce((init, current) => {
          if (init.length === 0 || init[init.length - 1] !== current) {
            init.push(current);
          }
          return init;
        }, []);
      return entities.length
    },
    filterLanguages() {
      const languages = this.examplesList.items.map(el => el.language)
      const result = languages.sort().reduce((init, current) => {
        if (init.length === 0 || init[init.length - 1] !== current) {
          init.push(current);
        }
        return init;
      }, []);
      return result.length
    }
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors.scss";
@import "~@/assets/scss/variables.scss";


.sentences-resume {
  width: 100%;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  border-radius: $unnnic-border-radius-md;
  padding: $unnnic-spacing-stack-md;

  &__title,
  &__description {
    color: $unnnic-color-neutral-dark;
    font-family: $unnnic-font-family-secondary;
  }

  &__title {
    font-size: $unnnic-font-size-title-sm;
  }

  &__description {
    font-size: $unnnic-font-size-body-gt;
    margin-top: $unnnic-spacing-stack-xs;
  }

  &__wrapper {
    display: flex;
    margin-top: $unnnic-spacing-stack-md;
    gap: $unnnic-spacing-stack-sm;

    @media screen and (max-width: 970px) {
      flex-wrap: wrap;
    }

    &-cards {
      display: flex;
      gap: $unnnic-spacing-stack-sm;
      width: 100%;

      ::v-deep > div {
        width: 100%;
        .number-card {
          width: 100%;
          .unnnic-card-number {
            max-width: unset;
          }
        }
      }
    }

    &-buttons {
      display: flex;
      flex-direction: column;
      gap: $unnnic-spacing-stack-xs;

      @media screen and (max-width: 970px) {
        width: 100%;
      }
      .unnnic-button {
        width: 100%;
        min-width: 284px;
      }
    }
  }
}

.import-modal {
  /deep/ .unnnic-modal-container-background-body-alert_icon {
    display: none;
  }
  /deep/ .unnnic-modal-container-background-body-description {
    padding-bottom: 0;
  }
}
</style>
