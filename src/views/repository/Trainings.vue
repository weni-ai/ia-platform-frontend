<template>
  <repository-view-base
    :repository="repository"
    :error-code="errorCode">
    <div v-if="repository">
      <div class="trainings-repository__new-example">
        <div v-if="authenticated">
          <div v-if="repository.authorization.can_contribute">
            <div>
              <unnnic-card
                type="title"
                :title="$t('webapp.trainings.train_title')"
                :hasInformationIcon="false"
                icon="graph-status-circle-1"
                scheme="aux-purple"
              />
              <p
                v-html="$t('webapp.trainings.train_description', {link: 'https://docs.weni.ai/l/pt/bothub/'})"
                class="trainings-repository__description column is-6 p-0" />
            </div>
            <hr class="divider" />
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
            <new-example-form
              :repository="repository"
              @created="updateExampleList()"
              @eventStep="dispatchClick()"
            />
            <div
              v-if="examplesList && examplesList.count > 0"
              class="trainings-repository__new-example__train"
            >
              <div
                :id="getRequirements.ready_for_train
                || !noPhrasesYet ? 'tour-training-step-6' : ''"
                :is-next-disabled="true"
                :is-previous-disabled="true"
                class="trainings-repository__list-wrapper__tutorialStep">
                <train
                  :key="update"
                  :show-button="getRequirements.ready_for_train || !noPhrasesYet"
                  :repository="repository"
                  :authenticated="authenticated"
                  :version="getSelectedVersion"
                  :update-repository="async () => { updateRepository(false) }"
                  :examples-list="examplesList"
                  @trainProgressUpdated="trainProgress = $event"
                  @statusUpdated="updateTrainingStatus($event)"
                  @finishedTutorial="dispatchFinish()"
                  @tutorialReset="dispatchReset()"
                  @onTrain="sendEvent(); dispatchClick();"
                  @onTrainComplete="noPhrasesYet = true"
                  @onTrainReady="dispatchClick()"
                  @unauthorized="signIn()"
                  @updateItems="updatedExampleList()"
                />
              </div>
            </div>
            <div
              v-if="examplesList && examplesList.count > 0"
              class="is-flex is-align-items-baseline is-justify-content-space-between mt-6 mb-5"
            >
              <h2 class="trainings-repository__list-wrapper__title mb-0">
                {{ $t('webapp.trainings.sentences_to_train') }}
              </h2>
              <unnnic-button
                @click="openDeleteModal = true"
                type="secondary"
                size="large"
                :text="$tc('webapp.intent.delete_selected', sentencesCounter)"
                :disabled="sentencesCounter === 0"
                class="trainings-repository__button"
                iconLeft="delete-1-1"
              />
            </div>
            <examples-pending-training
              :update="updateList"
              :is-train="trainProgress"
              class="trainings-repository__new-example__pending-example"
              @exampleDeleted="updateExampleList"
              @noPhrases="noPhrasesYet = false"
              @onUpdateSelected="updateSelected"
              @onUpdateList="updateCount"
              @onEditSentence="updateExampleList"
            />
          </div>
          <authorization-request-notification
            v-else
            :available="!repository.available_request_authorization"
            :repository-uuid="repository.uuid"
            @onAuthorizationRequested="updateRepository(false)" />
        </div>
        <div v-else>
          <b-notification
            :closable="false"
            type="is-info">
            {{ $t('webapp.trainings.login') }}
          </b-notification>
          <login-form hide-forgot-password />
        </div>
      </div>
    </div>
    <tour
      v-if="activeTutorial === 'training'"
      :step-count="8"
      :next-event="eventClick"
      :finish-event="eventClickFinish"
      :reset-tutorial="eventReset"
      name="training"/>
      <unnnic-modal
      :showModal="openDeleteModal"
      :text="$t('webapp.trainings.delete_title')"
      scheme="feedback-red"
      modal-icon="alert-circle-1"
      @close="openDeleteModal = false"
    >
      <span
      slot="message"
      v-html="$t('webapp.trainings.delete_phrase_modal')" />
      <unnnic-button slot="options" type="terciary" @click="openDeleteModal = false">
        {{ $t("webapp.home.cancel") }}
      </unnnic-button>
      <unnnic-button
        slot="options"
        type="primary"
        scheme="feedback-red"
        @click="deleteSelectedItems"
      >
        {{ $t("webapp.trainings.delete_title") }}
      </unnnic-button>
    </unnnic-modal>
    <unnnic-modal
      :showModal="openSuccessModal"
      :text="$t('webapp.intent.delete_success_title')"
      scheme="feedback-green"
      modal-icon="check-circle-1-1"
      @close="openSuccessModal = false"
    >
      <span
      slot="message"
      v-html="$t('webapp.intent.delete_success_subtitle')" />
    </unnnic-modal>
    <template v-slot:loader>
      <trainings-loader />
    </template>
  </repository-view-base>
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
    TrainingsLoader
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
      return { ...query, ...(language ? { is_available_language: language } : {}) };
    },
    sentencesCounter() {
      if (this.selectedItems !== null) {
        return this.selectedItems.length
      }
      return 0
    },
  },
  methods: {
    ...mapActions([
      'trainRepository',
      'deleteExample'
    ]),
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
      if (this.activeTutorial === 'training') this.eventClickFinish = !this.eventClickFinish;
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
      this.updateRepository(false)
    },
    updateSelected(params) {
      this.selectedItems = params
    },
    async deleteSelectedItems() {
      await this.selectedItems.forEach((item) => {
        this.deleteExample({ id: item.id });
        this.repository.examples__count -= 1;
        this.openDeleteModal = false;
        this.openSuccessModal = true;
      });
      await this.updateExampleList()
    },
    updateCount(value) {
      this.examplesList = value
    },
    updateExampleList() {
      this.updateList = !this.updateList;
      this.updateTrainingStatus();
    }
  },
};
</script>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/variables.scss';
  @import "~@weni/unnnic-system/dist/unnnic.css";
  @import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";


.trainings-repository {
  &__list-wrapper {
    // display: flex;
    // justify-content: space-between;
    // margin-bottom: .5rem;

    &__title{
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-title-sm;
      color: $unnnic-color-neutral-dark;
      margin-bottom: 1px;
    }
     &__subtitle{
      font-size: $font-size;
    }

    &__button{
      color: $color-white;
      width: 14rem;

      &:hover{
        color: $color-white;
      }
    }

    &__tutorialStep{
      width: 100%;
      height: 100%;
    }
  }

  &__new-example {
    margin-top: 1rem;
    background-color: $color-white;

    &__pending-example{
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

        p{
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
      content: "";
      background-size: 100%;
      background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.603) 25%,
                                        rgba(0, 0, 0, 0) 25%,
                                        rgba(0, 0, 0, 0) 50%,
                                        rgba(255, 255, 255, 0.603) 50%,
                                        rgba(255, 255, 255, 0.603) 75%,
                                        rgba(0, 0, 0, 0) 75%,
                                        rgba(0, 0, 0, 0));
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
      font-family: 'Lato';
      font-size: 14px;
      color: #4E5666;
      margin-top: 1rem;

      /deep/ a {
        color: #4E5666;
        text-decoration: underline;
        font-weight: 700;
      }
    }
}
.divider {
  background: #E2E6ED;
  height: 1px;
  margin: 2rem 0;
}

/deep/ input:focus, /deep/ textarea:focus {
  box-shadow: none;
  border-color: #9caccc;
}

/deep/ input, /deep/ textarea {
  height: auto;
}
</style>
