<template>
  <RepositoryViewBase
    :repository="repository"
    :errorCode="errorCode"
  >
    <div
      v-if="repository && repository.authorization.can_contribute"
      class="repository-log"
    >
      <UnnnicIntelligenceHeader
        :title="$t('webapp.menu.inbox')"
        icon="messages-bubble-1"
        iconScheme="aux-blue"
        :description="$t('webapp.inbox.description')"
      >
        <div class="repository-log__header__buttons">
          <UnnnicButton
            :text="$tc('webapp.inbox.add_to_train_button', sentencesCounter)"
            id="tour-inbox-step-2"
            :isPreviousDisabled="true"
            type="secondary"
            iconLeft="graph-status-circle-1"
            :disabled="sentencesCounter === 0"
            @click.prevent.stop="showModalTraining($t('webapp.inbox.training'))"
            class="header-button"
          />

          <UnnnicButton
            :text="$tc('webapp.inbox.add_to_sentence_button', sentencesCounter)"
            id="tour-inbox-step-3"
            :isPreviousDisabled="true"
            :isNextDisabled="true"
            iconLeft="check-square-1"
            type="secondary"
            :disabled="sentencesCounter === 0"
            @click.prevent.stop="
              showModalSentence($t('webapp.inbox.test_sentences'))
            "
            class="header-button"
          />
        </div>
      </UnnnicIntelligenceHeader>

      <UnnnicDivider ySpacing="lg" />

      <!-- <filter-evaluate-example
          v-if="repository"
          :intents="repository.intents_list"
          :versions="versions"
          language-filter
          :hasVersion="false"
          @querystringformatted="onSearch($event)"
        /> -->

      <SentenceFilters
        :intents="repository.intents_list"
        :versions="versions"
        languageFilter
        :hasVersion="false"
        :searchFilterLabel="$t('webapp.inbox.search_label')"
        @querystringformatted="onSearch($event)"
        @textData="changedText($event)"
      />
      <RepositoryLogList
        :perPage="perPage"
        :query="query"
        :editable="repository.authorization.can_contribute"
        @dispatchNext="dispatchClick()"
        @dispatchSkip="dispatchClickSkip()"
        @finishedTutorial="dispatchClickFinish()"
        @onUpdateSelected="updateSelected"
      />
    </div>
    <UnnnicModal
      :showModal="openModalTraining"
      :text="$t('webapp.example.sent_to_training')"
      scheme="feedback-green"
      modalIcon="check-circle-1-1"
      @close="openModalTraining = false"
    >
      <span slot="message">
        {{ $t('webapp.example.sent_to_training_info') }}
      </span>
    </UnnnicModal>
    <UnnnicModal
      :showModal="openModalTest"
      :text="$t('webapp.example.sent_to_test')"
      scheme="feedback-green"
      modalIcon="check-circle-1-1"
      @close="openModalTest = false"
    >
      <span slot="message">
        {{ $t('webapp.example.sent_to_test_info') }}
      </span>
    </UnnnicModal>

    <Tour
      v-if="activeTutorial === 'inbox'"
      :stepCount="5"
      :nextEvent="eventClick"
      :skipEvent="eventSkip"
      :finishEvent="eventClickFinish"
      name="inbox"
    />
    <template v-slot:loader>
      <LogLoader />
    </template>
  </RepositoryViewBase>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import RepositoryLogList from '@/components/repository/repository-log/RepositoryLogList';
import AuthorizationRequestNotification from '@/components/repository/AuthorizationRequestNotification';
import LoginForm from '@/components/auth/LoginForm';
import FilterEvaluateExample from '@/components/repository/repository-evaluate/example/FilterEvaluateExample';
import { LANGUAGES, getWordIndex } from '@/utils';
import Tour from '@/components/Tour';
import SentenceFilters from '@/components/repository/repository-evaluate/example/SentenceFilters';
import IntentModalEdition from '@/components/repository/IntentModalWithEdition';
import IntentModal from '@/components/repository/IntentModal';
import RepositoryBase from './Base';
import LogLoader from '@/views/repository/loadings/Log';

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
    SentenceFilters,
    IntentModalEdition,
    LogLoader,
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
      eventClickFinish: false,
      selectedItems: [],
      logData: [],
      intent: '',
      openModalTraining: false,
      openModalTest: false,
    };
  },
  computed: {
    ...mapGetters({
      authenticated: 'authenticated',
      activeTutorial: 'activeTutorial',
      version: 'getSelectedVersion',
    }),
    languages() {
      return Object.keys(this.repository.evaluate_languages_count).map(
        (lang) => ({
          value: lang,
          title: LANGUAGES[lang],
        }),
      );
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
    },
    sentencesCounter() {
      if (this.selectedItems !== null) {
        return this.selectedItems.length;
      }
      return 0;
    },
    confidenceVerify() {
      if (this.logData.length > 1) {
        return true;
      }
      return false;
    },
  },
  watch: {
    async repositoryUUID() {
      if (!this.repositoryUUID) {
        return;
      }
      this.versionsList = await this.getVersions({
        limit: this.perPage,
        query: { repository: this.repositoryUUID },
      });
      this.versionsList.getAllItems();
    },
    selectedItems() {
      this.logData = this.selectedItems.map((e) => ({
        data: {
          repository: this.repositoryUUID,
          repository_version: e.nlp_log.repository_version,
          text: e.nlp_log.text,
          language: e.nlp_log.language,
          entities: Object.keys(e.nlp_log.entities)
            .map((key) =>
              e.nlp_log.entities[key].map((entity) => {
                // if (entity.start && entity.end) return entity;
                const { start, end } = getWordIndex(
                  entity.value,
                  e.nlp_log.text,
                );
                return {
                  entity: entity.entity,
                  start,
                  end,
                };
              }),
            )
            .flat(),
          intent: e.nlp_log.intent.name,
          is_corrected: true,
        },
        id: e.id,
      }));
    },
  },
  methods: {
    ...mapActions([
      'getVersions',
      'searchLogs',
      'newEvaluateExample',
      'newExample',
      'deleteExample',
    ]),
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
    },
    updateSelected(params) {
      this.selectedItems = params;
    },
    showModalTraining(typeModal) {
      if (this.activeTutorial === 'inbox') return;

      if (this.logData.length === 0) {
        this.$buefy.toast.open({
          message: this.$t('webapp.inbox.select_phrase'),
          type: 'is-danger',
        });
        return;
      }
      this.$buefy.modal.open({
        props: {
          info: this.selectedItems[0].nlp_log,
          repository: this.repository,
          titleHeader: typeModal,
          confidenceVerify: this.confidenceVerify,
          logData: this.logData[0],
          buttonLabel: this.$t('webapp.inbox.add_to_train'),
        },
        parent: this,
        component: IntentModalEdition,
        hasModalCard: false,
        trapFocus: true,
        canCancel: false,
        events: {
          addedIntent: (value) => {
            this.verifyIsCorrected(value);
            this.addToTraining(value);
            this.intent = value;
          },
          closeModal: () => {
            // this.logData = [];
            // this.select = '';
            // this.$root.$emit('selectAll', false);
          },
        },
      });
    },
    showModalSentence(typeModal) {
      if (this.logData.length === 0) {
        this.$buefy.toast.open({
          message: this.$t('webapp.inbox.select_phrase'),
          type: 'is-danger',
        });
        return;
      }
      this.$buefy.modal.open({
        props: {
          info: this.selectedItems[0].nlp_log,
          repository: this.repository,
          titleHeader: typeModal,
          logData: this.logData[0],
          buttonLabel: this.$t('webapp.inbox.add_to_sentence'),
        },
        parent: this,
        component: IntentModalEdition,
        hasModalCard: false,
        trapFocus: true,
        canCancel: false,
        events: {
          addedIntent: (value) => {
            this.verifyIsCorrected(value);
            this.addToSentences(value);
            this.intent = value;
            if (this.activeTutorial === 'inbox') {
              this.$emit('finishedTutorial');
            }
          },
          closeModal: () => {
            this.logData = [];
            // this.select = '';
            // this.$root.$emit('selectAll', false);
            if (this.activeTutorial === 'inbox') {
              this.$emit('dispatchSkip');
            }
          },
        },
      });
      this.$nextTick(() => {
        this.$emit('dispatchNext');
      });
    },
    verifyIsCorrected(value) {
      if (value === this.selectedItems[0].nlp_log.intent.name) {
        this.isCorrected = false;
      } else {
        this.isCorrected = true;
      }
    },
    addToTraining(values) {
      // this.loadingLogs = true;
      this.logData.map(async ({ data }) => {
        try {
          if (this.logData.length > 1) {
            await this.newExample({
              entities: data.entities,
              repository: data.repository,
              intent: values.intent,
              language: data.language,
              text: data.text,
              isCorrected: this.isCorrected,
              repositoryVersion: this.version,
            });
            // this.$buefy.toast.open({
            //   message: `${data.text.bold()}, ${this.$t('webapp.inbox.entry_has_add_to_train')}`,
            //   type: 'is-success'
            // });
            this.openModalTraining = true;
          } else {
            await this.newExample({
              ...data,
              intent: values.intent,
              text: values.text,
              entities: values.entities,
              isCorrected: this.isCorrected,
              repositoryVersion: this.version,
            });
            // this.$buefy.toast.open({
            //   type: 'is-success',
            //  message: `${values.text.bold()}, ${this.$t('webapp.inbox.entry_has_add_to_train')}`,
            // });
            this.openModalTraining = true;
          }
        } catch (error) {
          this.showError(error, data, 'training');
          // this.openSuccessTraining();
        } finally {
          this.loadingLogs = false;
          this.select = false;
        }
      });
    },
    addToSentences(values) {
      this.loadingLogs = true;
      this.logData.map(async ({ data }) => {
        try {
          if (this.logData.length > 1) {
            await this.newEvaluateExample({
              entities: data.entities,
              repository: data.repository,
              intent: values.intent,
              language: data.language,
              text: data.text,
              isCorrected: this.isCorrected,
              repositoryVersion: this.version,
            });
            // this.$buefy.toast.open({
            // message: `${data.text.bold()}, ${this.$t('webapp.inbox.entry_has_add_to_sentence')}`,
            //   type: 'is-success'
            // });
            this.openModalTest = true;
          } else {
            await this.newEvaluateExample({
              ...data,
              intent: values.intent,
              text: values.text,
              entities: values.entities,
              isCorrected: this.isCorrected,
              repositoryVersion: this.version,
            });
            // this.$buefy.toast.open({
            //   message: `${values.text.bold()}, ${this.$t(
            //     'webapp.inbox.entry_has_add_to_sentence'
            //   )}`,
            //   type: 'is-success'
            // });
            this.openModalTest = true;
          }
        } catch (error) {
          this.showError(error, data, 'evaluate');
        } finally {
          this.loadingLogs = false;
          this.select = false;
        }
      });
    },
    showError(error, log, type) {
      console.log(error.response.data);
      let messages = '';
      if (type === 'evaluate') {
        messages =
          Object.values(error.response.data.non_field_errors).length >= 1
            ? this.$t('webapp.inbox.send_to_evaluate')
            : '';
      } else {
        messages = Object.values(error.response.data).map((errors) =>
          typeof errors === 'string' ? errors : Array.join(errors, ','),
        );
      }
      const message = `${log.text.bold()}, ${messages}`;
      this.$buefy.toast.open({
        message,
        type: 'is-danger',
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';
@import '@/assets/scss/variables.scss';
@import '@weni/unnnic-system/dist/unnnic.css';
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

label {
  vertical-align: middle;
}

.header-button {
  width: 15.3125 * $unnnic-font-size;
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

:deep(.filter-evaluate-example) {
  margin: 0 auto 1.3rem;
}
</style>
