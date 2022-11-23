<template>
  <div class="log-accordion" >
    <log-info
      :entities-list="entitiesList"
      :intent="nlp_log.intent.name"
      :confidence="nlp_log.intent.confidence"
      :created-at="created_at"
      :version-name="version_name"
      :highlighted.sync="highlighted"
      @onShowRawInfo="showRawInfo()"
      @debug="debug()"
    />
    <repository-debug
      v-if="showDebug"
      :repositoryUUID="this.repository.uuid"
      :version="this.nlp_log.repository_version"
      :language="this.nlp_log.language"
      :text="this.text"
      @closeModal="showDebug = false"
    />
    <raw-info v-if="showRaw" :info="this.nlp_log" @closeModal="showRaw = false" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { getEntityColor } from '@/utils/entitiesColors';
import { getWordIndex } from '@/utils';
import LogInfo from '@/components/shared/accordion/LogInfo';
import SentenceAccordion from '@/components/shared/accordion/SentenceAccordion';
import LanguageBadge from '@/components/shared/LanguageBadge';
import HighlightedText from '@/components/shared/HighlightedText';
import RawInfo from '@/components/shared/RawInfo';
import RepositoryDebug from '@/components/repository/debug/Debug';
import IntentModal from '@/components/repository/IntentModal';


export default {
  name: 'LogAccordion',
  components: {
    SentenceAccordion,
    LogInfo,
    LanguageBadge,
    HighlightedText,
    RawInfo,
    IntentModal,
    RepositoryDebug
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
    created_at: {
      type: String,
      default: '',
    },
    version_name: {
      type: String,
      default: '',
    },
    editable: {
      type: Boolean,
      default: false,
    },
    isAccordionOpen: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      deleteDialog: null,
      open: true,
      loading: false,
      isRawInfoActive: false,
      intent: '',
      isCorrected: Boolean,
      checked: false,
      highlighted: null,
      showRaw: false,
      showDebug: false
    };
  },
  computed: {
    ...mapState({
      repository: state => state.Repository.selectedRepository,
    }),
    entities() {
      return Object.keys(this.nlp_log.entities).map(key => this.nlp_log.entities[key].map(
        (entity) => {
          if (entity.start && entity.end) return entity;
          const { start, end } = getWordIndex(entity.value, this.text);
          return {
            start,
            end,
            ...entity,
          };
        },
      )).flat();
    },
    entitiesList() {
      return this.entities
        .map((entity, index) => ({
          value: this.entities[index],
          class: this.getEntityClass(this.entities[index]),
          ...entity,
        }));
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
  watch: {
    checked() {
      if (this.checked) {
        this.$emit('dispatchEvent', { event: 'event_nlp', value: this.nlp_log });
        this.$emit('dispatchEvent', { event: 'event_addLog', value: { id: this.id, data: this.toExample } });
      } else {
        this.$emit('dispatchEvent', { event: 'event_removeLog', value: this.id });
      }
    },
    isAccordionOpen() {
      this.open = true;
    },
  },
  created() {
    this.$root.$on('selectAll', value => this.selectAll(value));
  },
  methods: {
    selectAll(value) {
      this.checked = value;
    },
    getEntityClass(entity) {
      return `entity-${getEntityColor(entity)}`;
    },
    showRawInfo() {
      // this.$buefy.modal.open({
      //   props: { info: this.nlp_log },
      //   parent: this,
      //   component: RawInfo,
      //   hasModalCard: false,
      //   trapFocus: true,
      // });
      this.showRaw = true
    },
    debug() {
      // this.$buefy.modal.open({
      //   parent: this,
      //   component: RepositoryDebug,
      //   props: {
      //     repositoryUUID: this.repository.uuid,
      //     version: this.nlp_log.repository_version,
      //     language: this.nlp_log.language,
      //     text: this.text,
      //   },
      //   hasModalCard: false,
      //   trapFocus: true,
      // });
      this.showDebug = true
    },
  },
};
</script>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
  @import "~@weni/unnnic-system/dist/unnnic.css";
  @import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";
.log-accordion {
  &__menu-title {
    margin: 1rem;
  }
  &__version-name {
    font-size: $unnnic-font-size-body-md;
    font-weight: $unnnic-font-weight-bold;

    &--regular {
      font-size: $unnnic-font-size-body-md;
      font-weight: $unnnic-font-weight-regular;
    }
  }
}
</style>
