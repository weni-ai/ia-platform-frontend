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
          :count="getCurrentRepository.examples__count"
        />
        <NumbersCard
          :label="$t('webapp.resumeSentences.intentions')"
          :count="getCurrentRepository.intents_list.length"
        />
        <NumbersCard
          :label="$t('webapp.resumeSentences.entities')"
          :count="getCurrentRepository.entities.length"
        />
        <NumbersCard
          :label="$t('webapp.resumeSentences.languages')"
          :count="getCurrentRepository.available_languages.length"
        />
      </div>

      <div class="sentences-resume__wrapper-buttons">
        <unnnic-button
          type="primary"
          size="large"
          :disabled="buttonDisabled"
          :loading="buttonLoading"
          @click="train()"
        >
          {{ $t("webapp.trainings.run_training") }}
        </unnnic-button>
        <unnnic-button
          type="secondary"
          size="large"
          @click.native="setVisibleMigrateModal()"
        >
          {{ $t("webapp.translate.import_title") }}
        </unnnic-button>
      </div>
    </div>

    <ImportDataModal
      :is-modal-visible="importModalVisible"
      :is-import-button-visible="intelligenceFile === null"
      @selectedFileChanged="intelligenceFile = $event"
      @dispatchCloseModal="closeImportModal()"
      @dispatchImportNotification="dispatchNotification($event)"
    />
    <MigrateIntelligenceModal
      :is-modal-visible="migrateModalVisible"
      @selectedFileChanged="intelligenceFile = $event"
      @dispatchCloseModal="closeMigrateModal()"
      @dispatchMigrateNotification="dispatchNotification($event)"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import SummaryInformation from '@/components/repository/SummaryInformation';
import NumbersCard from '@/components/shared/NumbersCard';
import ImportDataModal from '@/components/shared/ImportDataModal';
import MigrateIntelligenceModal from '@/components/shared/MigrateIntelligenceModal';

export default {
  name: 'SentencesResume',
  components: {
    SummaryInformation,
    NumbersCard,
    ImportDataModal,
    MigrateIntelligenceModal,
  },
  computed: {
    ...mapGetters(['getCurrentRepository']),
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
  },
  data() {
    return {
      intelligenceFile: null,
      importModalVisible: false,
      migrateModalVisible: false,
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
    setVisibleMigrateModal() {
      this.migrateModalVisible = true;
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
@import "~@/assets/scss/colors.scss";
@import "~@/assets/scss/variables.scss";
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.sentences-resume {
  width: 100%;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  border-radius: $unnnic-border-radius-md;
  padding: $unnnic-spacing-stack-sm;

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
</style>
