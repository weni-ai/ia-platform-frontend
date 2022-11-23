<template>
  <repository-view-base :repository="repository" :error-code="errorCode">
    <div v-if="authenticated" class="repository-log">
      <div v-if="repository && repository.authorization.can_contribute">
        <div class="repository-log__header">
          <div class="column is-5 p-0">
            <unnnic-card
              type="title"
              :title="$t('webapp.menu.inbox')"
              :hasInformationIcon="false"
              icon="messages-bubble-1"
              scheme="aux-blue"
            />
            <p class="repository-log__subtitle">
              {{ $t("webapp.inbox.description") }}
            </p>
          </div>
          <div class="repository-log__header__buttons">
            <unnnic-button
              :text="$t('webapp.inbox.add_to_train_button')"
              id="tour-inbox-step-2"
              :is-previous-disabled="true"
              type="secondary"
              iconLeft="graph-status-circle-1"
              disabled
              @click="showModalTraining($t('webapp.inbox.training'))"
            />
            <unnnic-button
              :text="$t('webapp.inbox.add_to_sentence_button')"
              id="tour-inbox-step-3"
              :is-previous-disabled="true"
              :is-next-disabled="true"
              iconLeft="check-square-1"
              type="secondary"
              disabled
              @click="showModalSentence($t('webapp.inbox.test_sentences'))"
            />
          </div>
        </div>
        <!-- <filter-evaluate-example
          v-if="repository"
          :intents="repository.intents_list"
          :versions="versions"
          language-filter
          :hasVersion="false"
          @querystringformatted="onSearch($event)"
        /> -->

        <hr class="divider" />

        <sentence-filters
          :intents="repository.intents_list"
          :versions="versions"
          language-filter
          :hasVersion="false"
          :searchFilterLabel="$t('webapp.inbox.search_label')"
          @querystringformatted="onSearch($event)"
          @textData="changedText($event)"/>
        <repository-log-list
          :per-page="perPage"
          :query="query"
          :editable="repository.authorization.can_contribute"
          @dispatchNext="dispatchClick()"
          @dispatchSkip="dispatchClickSkip()"
          @finishedTutorial="dispatchClickFinish()"
        />
      </div>
      <authorization-request-notification
        v-else-if="repository"
        :available="!repository.available_request_authorization"
        :repository-uuid="repositoryUUID"
        @onAuthorizationRequested="updateRepository(false)"
      />
    </div>

    <div v-else>
      <b-notification :closable="false" class="is-info">
        {{ $t("webapp.inbox.signin_you_account") }}
      </b-notification>
      <login-form hide-forgot-password />
    </div>

    <tour
      v-if="activeTutorial === 'inbox'"
      :step-count="5"
      :next-event="eventClick"
      :skip-event="eventSkip"
      :finish-event="eventClickFinish"
      name="inbox"
    />
  </repository-view-base>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import RepositoryLogList from '@/components/repository/repository-log/RepositoryLogList';
import AuthorizationRequestNotification from '@/components/repository/AuthorizationRequestNotification';
import LoginForm from '@/components/auth/LoginForm';
import FilterEvaluateExample from '@/components/repository/repository-evaluate/example/FilterEvaluateExample';
import { LANGUAGES } from '@/utils';
import Tour from '@/components/Tour';
import SentenceFilters from '@/components/repository/repository-evaluate/example/SentenceFilters';


import IntentModal from '@/components/repository/IntentModal';
import RepositoryBase from './Base';

export default {
  name: 'RepositoryLog',
  components: {
    RepositoryViewBase,
    RepositoryLogList,
    LoginForm,
    AuthorizationRequestNotification,
    FilterEvaluateExample,
    Tour,
    IntentModal,
    SentenceFilters
  },
  extends: RepositoryBase,
  data() {
    return {
      perPage: 12,
      name: '',
      loading: false,
      versionsList: null,
      query: {},
      eventClick: false,
      eventSkip: false,
      eventClickFinish: false
    };
  },
  computed: {
    ...mapGetters(['authenticated', 'activeTutorial']),
    languages() {
      return Object.keys(this.repository.evaluate_languages_count).map(lang => ({
        value: lang,
        title: LANGUAGES[lang]
      }));
    },
    repositoryUUID() {
      if (!this.repository || this.repository.uuid === 'null') {
        return null;
      }
      return this.repository.uuid;
    },
    versions() {
      if (!this.versionsList) return [];
      return this.versionsList.items;
    }
  },
  watch: {
    async repositoryUUID() {
      if (!this.repositoryUUID) {
        return;
      }
      this.versionsList = await this.getVersions({
        limit: this.perPage,
        query: { repository: this.repositoryUUID }
      });
      this.versionsList.getAllItems();
    }
  },
  methods: {
    ...mapActions(['getVersions']),
    onSearch(query) {
      const filteredQuery = {};
      Object.entries({ ...this.query, ...query }).forEach(([key, value]) => {
        if (value && value.length > 0) filteredQuery[key] = value;
      });
      this.query = filteredQuery;
    },
    dispatchClickSkip() {
      this.eventSkip = !this.eventSkip;
    },
    dispatchClickFinish() {
      this.eventClickFinish = !this.eventClickFinish;
    },
    dispatchClick() {
      this.eventClick = !this.eventClick;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors.scss";
@import "~@/assets/scss/variables.scss";
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

label {
  vertical-align: middle;
}
.repository-log {
  font-family: $unnnic-font-family-secondary;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &__buttons {
      display: flex;
      gap: $unnnic-spacing-inset-sm;

      button {
        width: 245px;
      }
    }
  }

  &__icon {
    pointer-events: initial !important;
    cursor: pointer;
  }

  &__subtitle {
    font-size: $unnnic-font-size-body-gt;
    color: $unnnic-color-neutral-dark;
    line-height: $unnnic-line-height-md + $unnnic-font-size-body-gt;
    margin-top: $unnnic-spacing-stack-sm;
  }
}
.divider {
  background: $unnnic-color-neutral-soft;
  margin: $unnnic-spacing-stack-lg 0;
  height: 1px;
}
</style>
