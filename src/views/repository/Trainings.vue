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
              <p class="trainings-repository__description">
                {{ $t('webapp.trainings.train_description') }}
              </p>
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
              @created="updatedExampleList()"
              @eventStep="dispatchClick()"/>
            <examples-pending-training
              :update="update"
              :is-train="trainProgress"
              class="trainings-repository__new-example__pending-example"
              @exampleDeleted="onExampleDeleted"
              @noPhrases="noPhrasesYet = false"
            />
            <div class="trainings-repository__new-example__train">
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
                  @trainProgressUpdated="trainProgress = $event"
                  @statusUpdated="updateTrainingStatus($event)"
                  @finishedTutorial="dispatchFinish()"
                  @tutorialReset="dispatchReset()"
                  @onTrain="sendEvent(); dispatchClick();"
                  @onTrainComplete="noPhrasesYet = true"
                  @onTrainReady="dispatchClick()"
                  @unauthorized="signIn()" />
              </div>
            </div>
          </div>
          <authorization-request-notification
            v-else
            :available="!repository.available_request_authorization"
            :repository-uuid="repository.uuid"
            @onAuthorizationRequested="updateRepository(false)" />

            <SentencesResume />
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
import SentencesResume from '@/components/repository/training/SentencesResume';

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
    SentencesResume,
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
  },
  methods: {
    ...mapActions([
      'trainRepository',
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
    },
    onExampleDeleted() {
      this.repository.examples__count -= 1;
      this.updateTrainingStatus();
      this.updatedExampleList();
    },
  },
};
</script>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/variables.scss';


.trainings-repository {
  &__list-wrapper {
    display: flex;
    justify-content: space-between;
    margin-bottom: .5rem;

    &__title{
      font-size: 1.75rem;
      font-weight: $font-weight-medium;
      color: $color-fake-black;
      margin-bottom: $between-title-subtitle;
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
      height: 2.2rem;
    }
  }

  &__new-example {
    margin-top: 1rem;
    background-color: $color-white;

    &__pending-example{
      margin-top: 1.6rem;
      min-height: 5rem;
    }

    &__train {
      display: flex;
      margin-top: -2rem;
      margin-bottom: 4rem;

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
}

</style>
