<template>
  <div class="sentences-resume">
    <h1 class="sentences-resume__title">
      {{$t('webapp.resumeSentences.title')}}
    </h1>
    <!-- <p class="sentences-resume__description">
      {{$t('webapp.resumeSentences.description')}}
    </p> -->
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
          iconLeft="graph-status-circle-1"
        >
          {{ $t("webapp.trainings.run_training") }}
        </unnnic-button>
        <unnnic-button
          type="secondary"
          size="large"
          :disabled="repository ? !repository.has_training : ''"
          :loading="evaluating"
          iconLeft="check-square-1"
          @click="newEvaluate()"
        >
          {{ $t("webapp.trainings.run_tests") }}
        </unnnic-button>
        <!-- <unnnic-button
          type="terciary"
          size="large"
          @click.native="setVisibleImportModal()"
        >
          {{ $t("webapp.translate.import_title") }}
        </unnnic-button> -->
      </div>
    </div>

    <div
      v-if="requirementsToTrainStatus || languagesWarningsStatus"
      class="train-modal__wrapper__content"
      >
        <div v-if="requirementsToTrainStatus">
          <div
            v-for="(requirements, lang) in requirementsToTrain"
            :key="lang"
            class="train-modal__wrapper__content__content-requirements"
          >
            <div
              v-for="(requirement, i) in requirements"
              :key="i"
              class="train-modal__wrapper__content__content-requirements__item"
            >
              <unnnic-icon icon="alert-circle-1-1" scheme="feedback-red" size="sm" />
              <div class="train-modal__wrapper__content__content-requirements__item__texts">
                <p class="is-flex">
                  <strong class="train-modal__wrapper__content__content-requirements__item__field">
                    {{ `[${lang.toUpperCase().replace('_','-')}]` }}
                  </strong>
                  <span>{{ firstText(requirement) }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="train-modal__wrapper__content__content-requirements">
          <div
            v-for="(warnings, lang) in languagesWarnings"
            :key="lang"
            class="train-modal__wrapper__content__content-requirements__item"
          >
            <unnnic-icon icon="alert-circle-1-1" scheme="feedback-red" size="sm" />
            <div class="train-modal__wrapper__content__content-requirements__item__texts">
              <p class="is-flex" v-for="(warning, index) in warnings" :key="index">
                <strong class="train-modal__wrapper__content__content-requirements__item__field">
                  {{ `[${lang.toUpperCase().replace('_','-')}]` }}
                </strong>
                <span>{{ firstText(warning) }}</span>
              </p>
            </div>
          </div>
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
import { mapGetters, mapActions } from 'vuex';
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
    ...mapGetters({
      repository: 'getCurrentRepository',
    }),
    stats() {
      if (this.examplesList) {
        return {
          count: this.examplesList.count,
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
    },
    requirementsToTrainStatus() {
      return Object.keys(this.requirementsToTrain).length !== 0;
    },
    languagesWarningsStatus() {
      return Object.keys(this.languagesWarnings).length !== 0;
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
    },
    requirementsToTrain: {
      type: Object,
      required: true
    },
    languagesWarnings: {
      type: Object,
      required: true
    },
    languageAvailableToTrain: {
      type: Array,
      required: true
    },
    runEvaluate: {
      type: Function,
    },
    evaluating: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      intelligenceFile: null,
      importModalVisible: false,
      migrateModalVisible: false,
      openNotificationModal: false,
      notificationModalType: '',
      notificationModalTitle: '',
      notificationModalMessage: '',
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
      const intents = this.examplesList.results.map(el => el.intent)
      const result = intents.sort().reduce((init, current) => {
        if (init.length === 0 || init[init.length - 1] !== current) {
          init.push(current);
        }
        return init;
      }, []);
      return result.length
    },
    filterEntities() {
      const entities = this.examplesList.results
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
      const languages = this.examplesList.results.map(el => el.language)
      const result = languages.sort().reduce((init, current) => {
        if (init.length === 0 || init[init.length - 1] !== current) {
          init.push(current);
        }
        return init;
      }, []);
      return result.length
    },
    firstText(requirement) {
      const initalText = requirement.split('\n');
      return initalText[0];
    },
    secondText(requirement) {
      const initalText = requirement.split('\n');
      return initalText[1];
    },
    async newEvaluate(){
      await this.runEvaluate();
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors.scss";
@import "~@/assets/scss/variables.scss";
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

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

.train-modal {
  max-height: 33.438rem;
  width: 41.563rem;
  background-color: $color-white;
  box-shadow: 0px 3px 6px #00000029;
  border-radius: 0.5rem;
  margin: auto;
  font-family: $font-family;
  &__close {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 1rem 1rem 0 0;
    cursor: pointer;
    &__icon {
      color: $color-grey;
    }
  }
  &__container {
    padding: 1rem 3rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  &__text-ready-train {
    font-size: 20px;
    color: $color-primary;
  }
  &__text-warning {
    font-size: 28px;
  }
  &__wrapper {
    padding: 1rem;
    &__subtitle {
      margin-bottom: 1.5rem;
    }
    &__content {
      // overflow: auto;
      // max-height: 13.75rem;
      // padding-right: $unnnic-spacing-stack-xs;
      margin-top: $unnnic-spacing-stack-md;
      &__content-requirements {
        display: flex;
        flex-direction: column;
        margin-bottom: $unnnic-spacing-inline-ant;
        gap: $unnnic-spacing-inline-ant;
        &__item {
          display: flex;
          gap: $unnnic-spacing-stack-xs;
          align-items: center;
          // background: $unnnic-color-background-snow;
          // box-shadow: $unnnic-shadow-level-near;
          // padding: 12px;
          // border-radius: $unnnic-border-radius-sm;

          &__texts {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            text-align: start;
            font-family: $unnnic-font-family-secondary;

            > div {
              color: $unnnic-color-neutral-darkest;
              font-size: $unnnic-font-size-body-sm;
              font-weight: $unnnic-font-weight-bold;
              line-height: $unnnic-font-size-body-sm + $unnnic-line-height-md;
            }

            p {
              color: $unnnic-color-neutral-dark;
              font-size: $unnnic-font-size-body-md;
              line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
            }

          }

          &__field {
            font-size: $unnnic-font-size-body-sm;
            font-weight: $unnnic-font-weight-bold;
            margin-right: $unnnic-spacing-inline-ant;
          }
        }
      }
    }
  }
  &__buttons {
    margin-top: $unnnic-spacing-stack-lg;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: $unnnic-spacing-stack-lg;
    button {
      width: 100%;
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
