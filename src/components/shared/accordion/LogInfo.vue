<template>
  <div class="log-entities__wrapper">
    <div class="level">
      <div
        class="level-left log-entities">
        <div v-if="entitiesList.length > 0">
          <strong>{{ $tc('webapp.inbox.entities', entitiesList.length) }}:</strong>
          <entity-tag
            v-for="(entity, i) in entitiesList"
            :key="i"
            :highlighted="entity.entity === highlighted"
            :color-class="entity.class"
            :entity-name="entity.entity"
            @mouseenter.native.stop="$emit('update:highlighted', entity.entity)"
            @mouseleave.native.stop="$emit('update:highlighted', null)"/>
        </div>
      </div>
      <div class="level-right">
        <b-button
          class="repository-log-info__button"
          rounded
          size="is-small"
          icon-left="chart-pie"
          @click="debug()"> {{ $t('webapp.inbox.debug') }} </b-button>
        <b-button
          class="repository-log-info__button"
          rounded
          size="is-small"
          icon-left="file-document-outline"
          @click="showRawInfo()"> {{ $t('webapp.inbox.raw') }} </b-button>
      </div>
    </div>
    <div class="log-infos level is-mobile">
      <div class="level-left">
        <div
          v-if="intent"
          class="level-item has-text-grey">
          <strong>{{ $t('webapp.inbox.intent') }}:&nbsp;</strong>
          <span>{{ intent }} ({{ confidence | percent }} {{ $t('webapp.inbox.confidence') }})</span>
        </div>
      </div>
      <div class="level-right">
        <div
          v-if="intent"
          class="level-item has-text-grey">
          <span>{{ createdAt | moment('from') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import EntityTag from '@/components/repository/repository-evaluate/example/EntityTag';
import IntentModal from '@/components/repository/IntentModal';
import IntentModalEdition from '@/components/repository/IntentModalWithEdition';

export default {
  name: 'LogInfo',
  components: {
    EntityTag,
    IntentModal,
    IntentModalEdition
  },
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
    text: {
      type: String,
      default: '',
    },
    nlp_log: {
      type: Object,
      required: true,
    },
    entitiesList: {
      type: Array,
      default: () => ([]),
    },
    entities: {
      type: Array,
      default: () => ([]),
    },
    intent: {
      type: String,
      default: '',
    },
    confidence: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: String,
      default: '',
    },
    highlighted: {
      type: String,
      default: null,
    },
    versionName: {
      type: String,
      default: null,
    }
  },
  data() {
    return {
      list: null,
      loading: false,
      versionsList: null,
      versions: [],
      select: '',
      logData: [],
      selectAll: false,
      nlp: {},
      loadingLogs: false,
      pageWasChanged: false,
      searchingLog: false,
      isCorrected: Boolean,
    };
  },
  computed: {
    ...mapGetters({
      repository: 'getCurrentRepository',
      version: 'getSelectedVersion',
      activeTutorial: 'activeTutorial'
    }),
    formattedDate() {
      const date = new Date(this.createdAt)
      return date.toLocaleString()
    },
    confidenceVerify() {
      if (this.logData.length > 1) {
        return true;
      }
      return false;
    },
    repositoryList() {
      if (!this.repository || this.repository.uuid === 'null') {
        return null;
      }
      return this.repository;
    },
    toExample() {
      return {
        repository: this.repository.uuid,
        repository_version: this.nlp_log.repository_version,
        text: this.text,
        language: this.nlp_log.language,
        entities: this.entities.map(entity => ({
          entity: entity.entity,
          start: entity.start,
          end: entity.end,
        })),
        intent: this.intent,
        is_corrected: this.isCorrected,
      };
    },
  },
  methods: {
    ...mapActions(['searchLogs', 'newEvaluateExample', 'newExample', 'deleteExample']),
    addLogStructure(logValue) {
      this.logData.push(logValue);
    },
    removeLogStructure(logId) {
      this.logData = this.logData.filter(log => log.id !== logId);
    },
    showRawInfo() {
      this.$emit('onShowRawInfo');
    },
    debug() {
      this.$emit('debug');
    },
    sendToTraining() {
      // this.$emit('sendToTraining');
      this.addLogStructure({ id: this.id, data: this.toExample });
      this.showModalTraining(this.$t('webapp.inbox.training'));
    },
    sendToTest() {
      // this.$emit('sendToTest');
      this.addLogStructure({ id: this.id, data: this.toExample });
      this.showModalSentence(this.$t('webapp.inbox.test_sentences'));
    },
    showModalTraining(typeModal) {
      if (this.activeTutorial === 'inbox') return;

      if (this.logData.length === 0) {
        this.$buefy.toast.open({
          message: this.$t('webapp.inbox.select_phrase'),
          type: 'is-danger'
        });
        return;
      }
      this.$buefy.modal.open({
        props: {
          info: this.nlp_log,
          repository: this.repository,
          titleHeader: typeModal,
          confidenceVerify: this.confidenceVerify,
          logData: this.logData[0]
        },
        parent: this,
        component: this.logData.length === 1 ? IntentModalEdition : IntentModal,
        hasModalCard: false,
        trapFocus: true,
        canCancel: false,
        events: {
          addedIntent: value => {
            this.verifyIsCorrected(value);
            this.addToTraining(value);
            this.intent = value;
          },
          closeModal: () => {
            this.logData = [];
            // this.select = '';
            // this.$root.$emit('selectAll', false);
          }
        }
      });
    },
    showModalSentence(typeModal) {
      if (this.logData.length === 0) {
        this.$buefy.toast.open({
          message: this.$t('webapp.inbox.select_phrase'),
          type: 'is-danger'
        });
        return;
      }
      this.$buefy.modal.open({
        props: {
          info: this.nlp_log,
          repository: this.repository,
          titleHeader: typeModal,
          logData: this.logData[0]
        },
        parent: this,
        component: this.logData.length === 1 ? IntentModalEdition : IntentModal,
        hasModalCard: false,
        trapFocus: true,
        canCancel: false,
        events: {
          addedIntent: value => {
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
          }
        }
      });
      this.$nextTick(() => {
        this.$emit('dispatchNext');
      });
    },
    verifyIsCorrected(value) {
      if (value === this.nlp.intent.name) {
        this.isCorrected = false;
      } else {
        this.isCorrected = true;
      }
    },
    addToTraining(values) {
      this.loadingLogs = true;
      this.logData.map(async ({ data }) => {
        try {
          if (this.logData.length > 1) {
            await this.newExample({
              entities: data.entities,
              repository: data.repository,
              intent: values,
              language: data.language,
              text: data.text,
              isCorrected: this.isCorrected,
              repositoryVersion: this.version
            });
            this.$buefy.toast.open({
              message: `${data.text.bold()}, ${this.$t('webapp.inbox.entry_has_add_to_train')}`,
              type: 'is-success'
            });
          } else {
            await this.newExample({
              ...data,
              intent: values.intent,
              text: values.text,
              entities: values.entities,
              isCorrected: this.isCorrected,
              repositoryVersion: this.version
            });
            this.$buefy.toast.open({
              message: `${values.text.bold()}, ${this.$t('webapp.inbox.entry_has_add_to_train')}`,
              type: 'is-success'
            });
          }
        } catch (error) {
          this.showError(error, data, 'training');
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
              intent: values,
              language: data.language,
              text: data.text,
              isCorrected: this.isCorrected,
              repositoryVersion: this.version
            });
            this.$buefy.toast.open({
              message: `${data.text.bold()}, ${this.$t('webapp.inbox.entry_has_add_to_sentence')}`,
              type: 'is-success'
            });
          } else {
            await this.newEvaluateExample({
              ...data,
              intent: values.intent,
              text: values.text,
              entities: values.entities,
              isCorrected: this.isCorrected,
              repositoryVersion: this.version
            });
            this.$buefy.toast.open({
              message: `${values.text.bold()}, ${this.$t(
                'webapp.inbox.entry_has_add_to_sentence'
              )}`,
              type: 'is-success'
            });
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
      let messages = '';
      if (type === 'evaluate') {
        messages = Object.values(error.response.data.non_field_errors).length >= 1
          ? this.$t('webapp.inbox.send_to_evaluate')
          : '';
      } else {
        messages = Object.values(error.response.data).map(errors => (typeof errors === 'string' ? errors : Array.join(errors, ',')));
      }
      const message = `${log.text.bold()}, ${messages}`;
      this.$buefy.toast.open({
        message,
        type: 'is-danger'
      });
    },
    async updateLogs() {
      const languageObject = this.repository.repository_version_language.find(
        lang => lang.language === this.query.language
      );
      const { language, ...queryParams } = this.query;
      this.list = await this.searchLogs({
        repositoryVersionLanguage: languageObject.id,
        query: queryParams,
        limit: this.perPage
      });
    }
  },
};
</script>

<style lang="scss" scoped>
@import '../../../assets/scss/utilities.scss';
.repository-log-info {
  &__button {
    margin-right: 0.5rem;
    color: #707070;
  }
}

.log {
  $radius: .5rem;

  margin: 1rem .5rem;
  overflow: visible;
  background-color: $white-bis;
  border-radius: $radius;

  &-text {
    display: flex;
    padding: 1rem 2rem;
    margin-bottom: 4px;
    background-color: $white-ter;
    border-radius: $radius;
    transition: box-shadow .2s ease;

    &__main {
      flex-grow: 1;
      font-size: 1.25rem;
    }

    &__rigth {
      flex-grow: 0;
    }
  }

  &-entities,
  &-infos {
    padding: .25rem .5rem .3rem 1rem;
  }

  &-entities {

    &__wrapper {
      margin: 0 0 0 2.5rem;

      strong {
        margin-right: 0.5rem;
      }
    }

    > * {
      margin: 0 .5rem 0 0;

      &:last-child {
        margin: 0;
      }
    }
  }
}
</style>
