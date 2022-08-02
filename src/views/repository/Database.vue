<template>
  <repository-view-base
    :repository="repository"
    :error-code="errorCode">
    <div v-if="repository">
      <div class="trainings-repository__new-example">
        <div v-if="authenticated">
          <div v-if="repository.authorization.can_contribute">
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
      <div
        v-if="authenticated && repository.authorization.can_contribute">
        <div class="trainings-repository__header">
          <div>
            <unnnic-card
              type="title"
              :title="$t('webapp.trainings.database')"
              :hasInformationIcon="false"
              icon="folder-1"
              scheme="aux-pink"
            />
            <p class="trainings-repository__description">
              {{ $t('webapp.trainings.database_description') }}
            </p>
          </div>
          <div>
            <unnnic-button
              @click="openDeleteModal = true"
              type="secondary"
              size="large"
              :text="$tc('webapp.intent.delete_selected', sentencesCounter)"
              :disabled="sentencesCounter === 0"
              class="trainings-repository__button"
            />
          </div>
        </div>
        <hr class="divider">
        <sentence-filters
          :intents="repository.intents_list"
          :entities="repository.entities"
          :language-filter="false"
          @querystringformatted="onSearch($event)"
          @textData="changedText($event)"/>
        <examples-list
          :query="translationQuery"
          :update="update"
          :text-data="textExample"
          translation-data
          @exampleDeleted="onExampleDeleted"
          @onUpdateSelected="updateSelected"
        />
      </div>
    </div>
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
  </repository-view-base>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import NewExampleForm from '@/components/example/NewExampleForm';
import SentenceFilters from '@/components/repository/repository-evaluate/example/SentenceFilters';
import ExamplesList from '@/components/example/ExamplesList';
import ExamplesPendingTraining from '@/components/example/ExamplesPendingTraining';
import LoginForm from '@/components/auth/LoginForm';
import AuthorizationRequestNotification from '@/components/repository/AuthorizationRequestNotification';
import { exampleSearchToDicty, exampleSearchToString } from '@/utils/index';
import RequestAuthorizationModal from '@/components/repository/RequestAuthorizationModal';
import Loading from '@/components/shared/Loading';
import RepositoryBase from './Base';

export default {
  name: 'RepositoryDatabase',
  components: {
    RepositoryViewBase,
    NewExampleForm,
    SentenceFilters,
    ExamplesList,
    LoginForm,
    AuthorizationRequestNotification,
    RequestAuthorizationModal,
    ExamplesPendingTraining,
    Loading,
  },
  extends: RepositoryBase,
  data() {
    return {
      querySchema: {},
      query: {},
      update: false,
      textExample: '',
      error: '',
      selectedItems: [],
      openDeleteModal: false,
      openSuccessModal: false,
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
    }
  },
  methods: {
    ...mapActions([
      'trainRepository',
      'deleteExample'
    ]),
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
    changedText(newText) {
      this.textExample = newText;
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
      this.updatedExampleList();
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
      await this.onExampleDeleted()
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
    margin-top: 1.5rem;
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

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    &__description {
      font-family: 'Lato';
      font-size: 14px;
      color: #4E5666;
      margin-top: 1rem;
    }

    &__button {
      width: 240px;
    }

}
.divider {
  background: #E2E6ED;
  height: 1px;
  margin: 2rem 0;
}


</style>
