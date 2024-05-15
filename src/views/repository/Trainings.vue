<template>
  <RepositoryViewBase
    :repository="repository"
    :errorCode="errorCode"
  >
    <div v-if="repository">
      <div class="trainings-repository__new-example">
        <div v-if="authenticated">
          <div v-if="repository.authorization.can_contribute">
            <UnnnicIntelligenceHeader
              :title="$t('webapp.trainings.train_title')"
              icon="graph-status-circle-1"
              iconScheme="aux-purple"
              :description="
                $t('webapp.trainings.train_description', {
                  link: 'https://docs.weni.ai/l/pt/bothub/',
                })
              "
            />

            <UnnnicDivider ySpacing="lg" />

            <div class="trainings-repository__list-wrapper">
              <div>
                <h2 class="trainings-repository__list-wrapper__title">
                  {{ $t('webapp.trainings.grid_text1') }}
                </h2>
                <!-- <span class="trainings-repository__list-wrapper__subtitle">
                  {{ $t('webapp.trainings.grid_text2') }}
                </span> -->
              </div>
            </div>
            <NewExampleForm
              :repository="repository"
              @created="updateExampleList()"
              @eventStep="dispatchClick()"
            />
            <div
              v-if="examplesList && examplesList.count > 0"
              class="trainings-repository__new-example__train"
            >
              <div
                :id="
                  getRequirements.ready_for_train || !noPhrasesYet
                    ? 'tour-training-step-6'
                    : ''
                "
                :is-next-disabled="true"
                :is-previous-disabled="true"
                class="trainings-repository__list-wrapper__tutorialStep"
              >
                <Train
                  :key="updateList"
                  :showButton="getRequirements.ready_for_train || !noPhrasesYet"
                  :repository="repository"
                  :authenticated="authenticated"
                  :version="getSelectedVersion"
                  :updateRepository="
                    async () => {
                      updateRepository(false);
                    }
                  "
                  :examplesList="examplesList"
                  @trainProgressUpdated="trainProgress = $event"
                  @statusUpdated="updateTrainingStatus($event)"
                  @finishedTutorial="dispatchFinish()"
                  @tutorialReset="dispatchReset()"
                  @onTrain="
                    sendEvent();
                    dispatchClick();
                  "
                  @onTrainComplete="noPhrasesYet = true"
                  @onTrainReady="dispatchClick()"
                  @unauthorized="signIn()"
                  @updateItems="updatedExampleList()"
                />
              </div>
            </div>
            <div
              v-if="examplesList && examplesList.count > 0"
              class="sentences-list"
            >
              <UnnnicIntelligenceText
                family="secondary"
                size="title-sm"
                color="neutral-dark"
              >
                {{ $t('webapp.trainings.sentences_to_train') }}
              </UnnnicIntelligenceText>

              <UnnnicButton
                @click="openDeleteModal = true"
                type="secondary"
                size="large"
                :text="$tc('webapp.intent.delete_selected', sentencesCounter)"
                :disabled="sentencesCounter === 0"
                class="trainings-repository__button"
                iconLeft="delete-1-1"
              />
            </div>
            <ExamplesPendingTraining
              :update="updateList"
              :isTrain="trainProgress"
              class="trainings-repository__new-example__pending-example"
              @exampleDeleted="updateExampleList"
              @noPhrases="noPhrasesYet = false"
              @onUpdateSelected="updateSelected"
              @onUpdateList="updateCount"
              @onEditSentence="updateExampleList"
            />
          </div>
          <AuthorizationRequestNotification
            v-else
            :available="!repository.available_request_authorization"
            :repositoryUuid="repository.uuid"
            @onAuthorizationRequested="updateRepository(false)"
          />
        </div>
        <div v-else>
          <BNotification
            :closable="false"
            type="is-info"
          >
            {{ $t('webapp.trainings.login') }}
          </BNotification>
          <LoginForm hideForgotPassword />
        </div>
      </div>
    </div>
    <Tour
      v-if="activeTutorial === 'training'"
      :stepCount="8"
      :nextEvent="eventClick"
      :finishEvent="eventClickFinish"
      :resetTutorial="eventReset"
      name="training"
    />
    <UnnnicModal
      :showModal="openDeleteModal"
      :text="$t('webapp.trainings.delete_title')"
      scheme="feedback-red"
      modalIcon="alert-circle-1"
      @close="openDeleteModal = false"
    >
      <span
        slot="message"
        v-html="$t('webapp.trainings.delete_phrase_modal')"
      />
      <UnnnicButton
        slot="options"
        type="tertiary"
        @click="openDeleteModal = false"
      >
        {{ $t('webapp.home.cancel') }}
      </UnnnicButton>
      <UnnnicButton
        slot="options"
        type="primary"
        scheme="feedback-red"
        @click="deleteSelectedItems"
      >
        {{ $t('webapp.trainings.delete_title') }}
      </UnnnicButton>
    </UnnnicModal>
    <UnnnicModal
      :showModal="openSuccessModal"
      :text="$t('webapp.intent.delete_success_title')"
      scheme="feedback-green"
      modalIcon="check-circle-1-1"
      @close="openSuccessModal = false"
    >
      <span
        slot="message"
        v-html="$t('webapp.intent.delete_success_subtitle')"
      />
    </UnnnicModal>
    <template v-slot:loader>
      <TrainingsLoader />
    </template>
  </RepositoryViewBase>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import Analytics from '@/utils/plugins/analytics';
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import NewExampleForm from '@/components/example/NewExampleForm';
import ExamplesPendingTraining from '@/components/example/ExamplesPendingTraining';
import LoginForm from '@/components/auth/LoginForm';
import AuthorizationRequestNotification from '@/components/repository/AuthorizationRequestNotification';
import { exampleSearchToDicty, exampleSearchToString } from '@/utils/index';
import RequestAuthorizationModal from '@/components/repository/RequestAuthorizationModal';
import Loading from '@/components/shared/Loading';
import Train from '@/components/repository/training/Train';
import Tour from '@/components/Tour';
import RepositoryBase from './Base';
import TrainingsLoader from '@/views/repository/loadings/Trainings';

export default {
  name: 'RepositoryTrainings',
  components: {
    RepositoryViewBase,
    NewExampleForm,
    LoginForm,
    AuthorizationRequestNotification,
    RequestAuthorizationModal,
    ExamplesPendingTraining,
    Loading,
    Train,
    Tour,
    TrainingsLoader,
  },
  extends: RepositoryBase,
  data() {
    return {
      querySchema: {},
      query: {},
      update: false,
      pendingList: false,
      eventClick: false,
      eventClickFinish: false,
      eventReset: false,
      blockedNextStepTutorial: false,
      textExample: '',
      noPhrasesYet: true,
      trainProgress: false,
      error: '',
      selectedItems: [],
      openDeleteModal: false,
      openSuccessModal: false,
      examplesList: null,
      updateList: false,
    };
  },
  computed: {
    ...mapGetters([
      'authenticated',
      'activeTutorial',
      'getSelectedVersion',
      'getRequirements',
    ]),
    translationQuery() {
      const { language, ...query } = this.query;
      return {
        ...query,
        ...(language ? { is_available_language: language } : {}),
      };
    },
    sentencesCounter() {
      if (this.selectedItems !== null) {
        return this.selectedItems.length;
      }
      return 0;
    },
  },
  methods: {
    ...mapActions(['trainRepository', 'deleteExample']),
    sendEvent() {
      Analytics.send({ category: 'Intelligence', event: 'on train event' });
    },
    onSearch(value) {
      Object.assign(this.querySchema, value);

      if (!this.querySchema.intent) {
        delete this.querySchema.intent;
      }
      if (!this.querySchema.entity) {
        delete this.querySchema.entity;
      }
      if (!this.querySchema.label) {
        delete this.querySchema.label;
      }
      if (!this.querySchema.language) {
        delete this.querySchema.language;
      }

      const formattedQueryString = exampleSearchToString(this.querySchema);
      this.query = exampleSearchToDicty(formattedQueryString);
    },
    updateTrainingStatus(trainStatus) {
      Object.assign(this.repository, trainStatus);
    },
    changedText(newText) {
      this.textExample = newText;
    },
    dispatchClick() {
      this.blockedNextStepTutorial = !this.blockedNextStepTutorial;
      this.eventClick = !this.eventClick;
    },
    dispatchFinish() {
      if (this.activeTutorial === 'training')
        this.eventClickFinish = !this.eventClickFinish;
    },
    dispatchReset() {
      this.eventReset = !this.eventReset;
    },
    signIn() {
      this.$router.push({
        name: 'signIn',
      });
    },
    updatedExampleList() {
      this.update = !this.update;
      this.updateRepository(false);
    },
    updateSelected(params) {
      this.selectedItems = params;
    },
    async deleteSelectedItems() {
      await this.selectedItems.forEach((item) => {
        this.deleteExample({ id: item.id });
        this.repository.examples__count -= 1;
        this.openDeleteModal = false;
        this.openSuccessModal = true;
      });
      await this.updateExampleList();
    },
    updateCount(value) {
      this.examplesList = value;
    },
    updateExampleList() {
      this.updateList = !this.updateList;
      this.updateTrainingStatus();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.sentences-list {
  margin-top: $unnnic-spacing-xl;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.trainings-repository {
  &__list-wrapper {
    // display: flex;
    // justify-content: space-between;
    // margin-bottom: .5rem;

    &__title {
      margin: 0;

      color: $unnnic-color-neutral-dark;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-title-sm;
      line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
    }
    &__subtitle {
      font-size: $font-size;
    }

    &__button {
      color: $color-white;
      width: 14rem;

      &:hover {
        color: $color-white;
      }
    }

    &__tutorialStep {
      width: 100%;
      height: 100%;
    }
  }

  &__new-example {
    margin-top: 1rem;
    background-color: $color-white;

    &__pending-example {
      margin-top: 1.6rem;
      min-height: 5rem;
      margin-bottom: 3rem;
    }

    &__train {
      display: flex;
      margin-top: 2.5rem;
      // margin-bottom: 15.5rem;

      &__progress {
        height: 25px;
        width: 60%;

        p {
          font-size: 13px;
          font-weight: $font-weight-bolder;
        }
      }

      &__bar {
        position: relative;
        display: block;
        width: 100%;
        background-color: $color-grey-light;
      }
      &__bar span {
        position: relative;
        display: inline-block;
        vertical-align: middle;
        height: 25px;
        background-color: $color-secondary;
      }
      &__bar span:after {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        content: '';
        background-size: 100%;
        background-image: linear-gradient(
          45deg,
          rgba(255, 255, 255, 0.603) 25%,
          rgba(0, 0, 0, 0) 25%,
          rgba(0, 0, 0, 0) 50%,
          rgba(255, 255, 255, 0.603) 50%,
          rgba(255, 255, 255, 0.603) 75%,
          rgba(0, 0, 0, 0) 75%,
          rgba(0, 0, 0, 0)
        );
        background-size: 30px 30px;
        opacity: 0.3;
        animation: progress-animation 0.5s infinite linear;
      }
      @-webkit-keyframes progress-animation {
        0% {
          background-position: 0 100%;
        }
        100% {
          background-position: 30px 100%;
        }
      }
      @keyframes progress-animation {
        0% {
          background-position: 0 100%;
        }
        100% {
          background-position: 30px 100%;
        }
      }
    }
  }

  &__description {
    color: $unnnic-color-neutral-dark;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;

    margin-block-start: $unnnic-spacing-sm;
    margin-block-end: 0;

    :deep(a) {
      color: inherit;
      text-decoration: underline;
      text-underline-offset: $unnnic-spacing-nano;
      font-weight: $unnnic-font-weight-bold;

      &:hover {
        color: $unnnic-color-neutral-darkest;
      }
    }
  }
}

:deep(input:focus),
:deep(textarea:focus) {
  box-shadow: none;
  border-color: #9caccc;
}

:deep(input),
:deep(textarea) {
  height: auto;
}
</style>
