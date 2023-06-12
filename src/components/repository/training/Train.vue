<template>
  <div class="train">
    <sentences-resume
      :buttonDisabled="
        loading ||
            repository.examples__count === 0
            || !isItOkToEnableButton
      "
      :buttonLoading="loading || !isItOkToEnableButton"
      buttonClass="train__button"
      :buttonClick="verifyTrain"
      :examples-list="examplesList"
      :requirements-to-train="trainRequirements"
      :languages-warnings="languagesWarnings"
      :language-available-to-train="languageAvailableToTrain"
      :evaluating="evaluating"
      :runEvaluate="newEvaluate"
      @onImportSuccess="updateItems"
    />
    <div v-if="trainProgress" class="train__progress">
      <unnnic-modal :showModal="true" :closeIcon="false">
        <div slot="message">
          <unnnic-progress-bar
            :value="progress"
            :title="$t('webapp.trainings.train_progress')"
            inline
          />
        </div>
      </unnnic-modal>
    </div>
    <train-modal
      v-if="repository"
      :training="training"
      :requirements-to-train="trainRequirements"
      :open="trainModalOpen"
      :languages-warnings="languagesWarnings"
      :language-available-to-train="languageAvailableToTrain"
      @finishedTutorial="finishedTutorial()"
      @resetTutorial="resetTutorial()"
      @proceedTrain="train()"
      @closeTrainModal="closeTrainModal()"
    />
    <train-response
      :open="trainResults"
      @dispatchCloseProgress="closeProgress()"
      @resetProgressValue="progress = 10"
    />
    <unnnic-modal
      :showModal="showEvaluateSuccess"
      :text="$tc('webapp.trainings.accuracy', accuracy)"
      scheme="feedback-green"
      modal-icon="check-circle-1-1"
      @close="showEvaluateSuccess = false"
    >
      <span
        slot="message"
      >
        {{ $t('webapp.trainings.evaluate_results',
          {count: intentsCount, success: intentsSuccess})
        }}
      </span>
      <unnnic-button slot="options" type="terciary" @click.prevent.stop="verifyTrain()">
        {{ $t('webapp.inbox.add_to_train') }}
      </unnnic-button>
      <unnnic-button
        slot="options"
        class="create-repository__container__button"
        type="secondary"
        @click.prevent.stop="goToEvaluateResult()"
      >
        {{ $t('webapp.trainings.see_result') }}
      </unnnic-button>
    </unnnic-modal>
    <unnnic-modal
        :showModal="alertForce"
        text="Com as novas frases, a força da IA vai cair.
          Deseja executar o treinamento mesmo assim?"
        scheme="feedback-yellow"
        modal-icon="alert-circle-1"
        :closeIcon="false"
        class="train__intelligence-force__modal"
      >
        <div slot="message">
          <div class="train__intelligence-force">
              <unnnic-chart-rainbow :value="75" description="Forte" />
              <div class="train__intelligence-force__arrow">
                <unnnic-icon-svg icon="keyboard-arrow-right-1" size="lg" />
              </div>
              <unnnic-chart-rainbow :value="60" description="Regular" />
          </div>
        </div>
        <div slot="message">
          <div class="mt-5 mb-2">
            Veja algumas recomendações para a força da IA não cair:
          </div>
          <unnnic-alert
            version="1.0"
            title=""
            text="Adicione mais frases na intenção symptoms"
            scheme="aux-blue"
            icon="study-light-idea-1"
          />
          <unnnic-alert
            version="1.0"
            title=""
            text="Adicione mais frases na intenção symptoms"
            scheme="aux-blue"
            icon="study-light-idea-1"
          />
        </div>
        <unnnic-button slot="options" type="terciary" @click.prevent.stop="alertForce = false">
          {{ $t("webapp.home.cancel") }}
        </unnnic-button>
        <unnnic-button
          slot="options"
          class="create-repository__container__button"
          type="secondary"
          @click.prevent.stop="verifyTrain()"
        >
          Executar treinamento
        </unnnic-button>
      </unnnic-modal>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import TrainModal from '@/components/repository/training/TrainModal';
import ProgressBar from '@/components/shared/ProgressBar';
import TrainResponse from '@/components/repository/training/TrainResponse';
import SentencesResume from './SentencesResume';

export default {
  name: 'TrainingProgress',
  components: {
    TrainModal,
    TrainResponse,
    ProgressBar,
    SentencesResume
  },
  props: {
    load: {
      type: Boolean,
      default: false
    },
    repository: {
      type: Object,
      required: true
    },
    version: {
      type: Number,
      required: true
    },
    updateRepository: {
      type: Function,
      default: async () => {}
    },
    authenticated: {
      type: Boolean,
      default: false
    },
    updateOnLoad: {
      type: Boolean,
      default: true
    },
    examplesList: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      trainModalOpen: false,
      trainResponseData: null,
      trainResponseOpen: false,
      trainResults: false,
      training: false,
      progress: 0,
      trainProgress: false,
      repositoryStatus: {},
      loadingStatus: false,
      languageAvailableToTrain: [],
      isItOkToEnableButton: false,
      evaluating: false,
      showEvaluateSuccess: false,
      evaluateResult: {},
      alertForce: false,
      intentsCount: '',
      intentsSuccess: '',
      accuracy: ''
    };
  },
  computed: {
    ...mapGetters(['getRequirements', 'getCurrentRepository']),
    loading() {
      return this.load || this.loadingStatus;
    },
    trainRequirements() {
      if (!this.getRequirements || this.getRequirements.requirements_to_train === undefined) {
        return {};
      }
      return this.getRequirements.requirements_to_train;
    },
    languagesWarnings() {
      if (!this.getRequirements || this.getRequirements.languages_warnings === undefined) {
        return {};
      }
      return this.getRequirements.languages_warnings;
    },
    repositoryCanWrite() {
      if (!this.repository || this.repository.authorization.can_write === 'null') {
        return null;
      }
      return this.repository.authorization.can_write;
    }
  },
  watch: {
    trainProgress() {
      this.$emit('trainProgressUpdated', this.trainProgress);
    },
    repositoryCanWrite() {
      if (this.repositoryCanWrite !== undefined) {
        this.getRepositoryStatus();
        this.resetTrainVariables();
      }
    }
  },
  mounted() {
    if (this.updateOnLoad) this.updateTrainingStatus();
    this.getRepositoryStatus();
    this.repositoryRequirements();
  },
  methods: {
    ...mapActions([
      'trainRepository',
      'getTrainingStatus',
      'getRepositoryStatusTraining',
      'setRepositoryTraining',
      'getRepositoryRequirements',
      'setRequirements',
      'runNewEvaluate'
    ]),
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    finishedTutorial() {
      this.$emit('finishedTurorial');
    },
    resetTutorial() {
      this.$emit('tutorialReset');
    },
    closeTrainModal() {
      this.trainModalOpen = false;
    },
    async repositoryRequirements() {
      try {
        const allRequirements = await Promise.all(
          this.getCurrentRepository.available_languages.map(async language => {
            const { data } = await this.getRepositoryRequirements({
              repositoryUuid: this.repository.uuid,
              version: this.repository.repository_version_id,
              repositoryLanguage: language
            });
            const currentRequirements = {
              ...data,
              requirements_to_train:
                data.requirements_to_train.length !== 0
                  ? { [language]: data.requirements_to_train }
                  : {},
              languages_warnings:
                data.languages_warnings.length !== 0 ? { [language]: data.languages_warnings } : {},
              language
            };
            return currentRequirements;
          })
        );
        this.languageAvailableToTrain = allRequirements.filter(
          language => language.ready_for_train
            && Object.keys(language.requirements_to_train).length === 0
            && Object.keys(language.languages_warnings).length === 0
        );
        const requirements = allRequirements.reduce((acumulator, requirement) => ({
          repository_version_id: requirement.repository_version_id,
          uuid: requirement.uuid,
          ready_for_train: requirement.ready_for_train,
          requirements_to_train: {
            ...acumulator.requirements_to_train,
            ...requirement.requirements_to_train
          },
          languages_warnings: {
            ...acumulator.languages_warnings,
            ...requirement.languages_warnings
          }
        }));
        this.isItOkToEnableButton = true;
        this.setRequirements(requirements);
      } catch (error) {
        this.error = error;
      }
    },
    async updateTrainingStatus() {
      this.loadingStatus = true;
      try {
        const trainStatus = await this.getTrainingStatus({
          repositoryUUID: this.repository.uuid,
          version: this.repository.repository_version_id
        });
        if (trainStatus) {
          this.$emit('statusUpdated', trainStatus);
        }
      } finally {
        this.loadingStatus = false;
      }
    },
    async dispatchTrain() {
      if (!this.authenticated) {
        this.$emit('unauthorized');
      }
      if (this.authenticated && this.repository.authorization.can_write) {
        this.loadingStatus = true;
        if (this.languageAvailableToTrain.length > 0) {
          await this.train();
          this.loadingStatus = false;
          return;
        }
        this.loadingStatus = false;
        this.trainModalOpen = true;
      }
      this.$emit('onTrain');
    },
    async verifyTrain() {
      this.showEvaluateSuccess = false
      this.alertForce = false
      if (
        Object.keys(this.getRequirements.languages_warnings).length
        || Object.keys(this.getRequirements.requirements_to_train).length
        || this.languageAvailableToTrain.length === 0
      ) {
        this.trainModalOpen = true;
        return;
      }
      this.dispatchTrain();
    },
    async train() {
      this.training = true;
      this.loadingStatus = true;
      try {
        await Promise.all(
          this.languageAvailableToTrain.map(async ({ language }) => {
            await this.trainRepository({
              repositoryUuid: this.repository.uuid,
              repositoryVersion: this.version,
              repositoryLanguage: language
            });
          })
        );
        await this.setRepositoryTraining(true);
        await this.updateRepository();
        await this.getRepositoryStatus();
      } catch (e) {
        this.$buefy.toast.open({
          message: this.$t('webapp.trainings.default_error'),
          type: 'is-danger'
        });
      }
      if (this.getRequirements.ready_for_train) {
        this.$emit('onTrainReady');
      }
      this.training = false;
      this.loadingStatus = false;
    },
    async getRepositoryStatus() {
      if (this.repository.uuid !== null && this.repositoryCanWrite) {
        const { data } = await this.getRepositoryStatusTraining({
          repositoryUUID: this.repository.uuid,
          repositoryVersion: this.version
        });
        this.repositoryStatus = data;
        if (this.repositoryStatus.results[0] !== undefined) {
          if (this.repositoryStatus.results[0].status === 0) {
            this.trainProgress = true;
            this.progress = 26;
          }
          if (this.repositoryStatus.results[0].status === 1) {
            this.trainProgress = true;
            this.progress = 68;
          }
          if (this.repositoryStatus.results[0].status === 2 && this.trainProgress) {
            this.progress = 100;
            this.setRepositoryTraining(false);
            this.trainResults = true;
            this.$emit('onTrainComplete');
          }
          setTimeout(() => {
            if (
              this.repositoryStatus.results[0].status === 0
              || this.repositoryStatus.results[0].status === 1
            ) {
              this.getRepositoryStatus();
            }
          }, 100000);
        }
      } else {
        this.resetTrainVariables();
      }
    },
    resetTrainVariables() {
      this.progress = 10;
      this.trainResults = false;
      this.trainProgress = false;
    },
    async closeProgress() {
      this.trainResults = false;
      this.trainProgress = false;
      await this.updateRepository(false);
    },
    updateItems() {
      this.updateTrainingStatus();
      this.getRepositoryStatus();
      this.repositoryRequirements();
      this.$emit('updateItems')
    },
    async newEvaluate() {
      this.evaluating = true;
      try {
        const result = await this.runNewEvaluate({
          repositoryUUID: this.repository.uuid,
          version: this.version,
          type: 0,
        });
        this.$buefy.toast.open({
          message: `${this.$t('webapp.inbox.entry_has_add_to_sentence')}`,
          type: 'is-success'
        });
        this.evaluateResult = result
        this.intentsCount = result.intents_count
        this.intentsSuccess = result.intents_success
        this.accuracy = result.accuracy
        this.showEvaluateSuccess = true;
      } catch (error) {
        this.$buefy.toast.open({
          message: `${error.response.data.detail || this.$t('webapp.evaluate-manual.default_error')} `,
          type: 'is-danger'
        });
      } finally {
        this.evaluating = false;
      }
    },
    goToEvaluateResult() {
      this.$router.push({
        name: 'repository-result',
        params: {
          ownerNickname: this.repository.owner.nickname,
          slug: this.repository.slug,
          resultId: this.evaluateResult.data.evaluate_id,
          version: this.evaluateResult.data.evaluate_version,
        },
      });
    },
    showAlertForce() {
      this.alertForce = true
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors.scss";
@import "~@/assets/scss/variables.scss";
.train {
  &__button {
    color: $color-white;
    margin-top: 1rem;
    width: 14rem;
    &:hover {
      color: $color-white;
    }
  }
  &__progress {
    height: 25px;
    width: 60%;
    p {
      font-size: 13px;
      font-weight: $font-weight-bolder;
    }
    /deep/ .unnnic-modal-container-background {
      height: 88px;
    }
    /deep/ .unnnic-modal-container-background-body {
      padding: 0
    }
    /deep/ .unnnic-modal-container-background-body-title {
      padding: 0
    }
    /deep/ .unnnic-modal-container-background-body-spacing_header {
      display: none;
    }
    /deep/ .unnnic-progress-bar.primary {
      padding: 2rem 1.5rem;
      white-space: nowrap;
    }
    /deep/ .unnnic-modal {
      z-index: 1;
    }
  }
  &__intelligence-force {
    display: flex;
    align-items: center;

    &__arrow {
      margin: 0 1rem;
    }

    &__modal {
      /deep/ .unnnic-modal-container-background {
        width: 780px;
      }
      /deep/ .unnnic-modal-container-background-body-description {
        padding-bottom: .5rem;
      }
      /deep/ .unnnic-alert {
        width: 100%;
        text-align: left;
        position: unset;
        margin-top: .5rem;

        .unnnic--clickable {
          display: none;
        }
      }
    }
  }
}
/deep/ .number {
    align-items: unset;
    background-color: unset;
    border-radius: 0;
    display: unset;
    height: 0;
    justify-content: unset;
    margin-right: 0;
    min-width: unset;
    padding: 0;
    text-align: unset;
   vertical-align: bottom;
 }
</style>
