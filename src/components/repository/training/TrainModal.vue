<template>
  <unnnic-modal
    :showModal="open"
    @close="closeModal"
    text="teste"
    description="teste"
    v-if="repositoryTrain"
  >
    <template #message>

    </template>
  </unnnic-modal>
  <unnnic-modal
    v-else
    :showModal="open"
    @close="closeModal"
    :text="$t('webapp.train_modal.language_warning')"
    description="Volte e corrija os erros encontrados ou prossiga e treine parcialmente."
    modalIcon="alert-circle-1"
    scheme="feedback-red"
  >
    <template #message>
      <div v-if="
        requirementsToTrainStatus ||
        languagesWarningsStatus ||
        languageAvailableToTrain.length === 0"
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
                <div class="train-modal__wrapper__content__content-requirements__item__field">
                  {{ `[${lang.toUpperCase().replace('_','-')}]` }}
                </div>
                <p> {{ firstText(requirement) }} </p>
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
              <div class="train-modal__wrapper__content__content-requirements__item__field">
                {{ `[${lang.toUpperCase().replace('_','-')}]` }}
              </div>
              <p v-for="(warning, index) in warnings" :key="index">
                <strong>{{ firstText(warning) }}</strong>
                <br />
                <span>{{ secondText(warning) }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div slot="options" class="train-modal__buttons">
        <unnnic-button
          ref="trainBtn"
          type="terciary"
          class="train-modal__buttons__style"
          @click="dispatchTrain()"
        >
          <span>{{ $t("webapp.train_modal.train") }}</span>
        </unnnic-button>
        <unnnic-button
          type="primary"
          ref="closeBtn"
          @click="closeModal()"
        >
          <span>{{ $t("webapp.train_modal.cancel") }}</span>
        </unnnic-button>
      </div>
    </template>
  </unnnic-modal>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import LanguageBadge from '@/components/shared/LanguageBadge';

export default {
  name: 'TrainModal',
  components: {
    LanguageBadge
  },
  props: {
    open: {
      type: Boolean,
      default: false
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
    training: {
      type: Boolean,
      default: false
    },
    repositoryTrain: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      blockedNextStepTutorial: false,
      repositoryStatus: {}
    };
  },
  computed: {
    ...mapGetters([
      'activeTutorial',
      'getCheckRepositoryTrain',
      'getSelectedVersionRepository',
      'getSelectedVersion'
    ]),
    requirementsToTrainStatus() {
      return Object.keys(this.requirementsToTrain).length !== 0;
    },
    languagesWarningsStatus() {
      return Object.keys(this.languagesWarnings).length !== 0;
    }
  },
  methods: {
    ...mapActions(['setRepositoryTraining', 'getRepositoryStatus']),
    firstText(requirement) {
      const initalText = requirement.split('\n');
      return initalText[0];
    },
    secondText(requirement) {
      console.log(this.languagesWarnings)
      const initalText = requirement.split('\n');
      return initalText[1];
    },
    closeModal() {
      if (this.activeTutorial === 'training') {
        this.$emit('resetTutorial');
      }
      this.$emit('closeTrainModal');
    },
    dispatchTrain() {
      this.$emit('proceedTrain');
      this.$emit('closeTrainModal');
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors.scss";
@import "~@/assets/scss/variables.scss";
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";
::-webkit-scrollbar {
  width: 0.25rem;
}
::-webkit-scrollbar-track {
  background: $unnnic-color-neutral-soft;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb {
  background: $unnnic-color-neutral-clean;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: $unnnic-color-neutral-dark;
}
:not(.quick-test) {
  pointer-events: visible;
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
      overflow: auto;
      max-height: 13.75rem;
      padding-right: $unnnic-spacing-stack-xs;
      margin-top: $unnnic-spacing-stack-md;
      &__content-requirements {
        display: flex;
        flex-direction: column;
        gap: $unnnic-spacing-stack-xs;
        &__item {
          display: flex;
          gap: $unnnic-spacing-stack-xs;
          align-items: center;
          background: $unnnic-color-background-snow;
          box-shadow: $unnnic-shadow-level-near;
          padding: 12px;
          border-radius: $unnnic-border-radius-sm;

          &__texts {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            text-align: start;

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
</style>
