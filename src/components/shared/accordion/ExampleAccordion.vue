<template>
  <SentenceAccordion
    :open.sync="isOpen"
    :pendingExample="pendingExample"
    :class="pendingExample ? 'pendingExample' : ''"
  >
    <div
      slot="header"
      class="level"
    >
      <div class="example-accordion__tag level-left">
        <LanguageBadge :language="language" />
      </div>

      <div
        v-show="!isOpen"
        class="level-right example-accordion__text"
      >
        {{ text }}
      </div>

      <div
        v-show="isOpen && !editing"
        class="level-right example-accordion__text"
      >
        <HighlightedText
          :text="text"
          :entities="entities"
          :highlighted="highlighted"
        />
      </div>
    </div>
    <div
      v-if="repository.authorization && repository.authorization.can_contribute"
      slot="options"
      class="level example-accordion__btns-wrapper"
    >
      <div class="level-right">
        <div class="level-item">
          <WordSuggestionButton
            v-show="!editing && suggestion"
            :getSentence="sentenceDetail"
            class="example-accordion__suggestion"
          />
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <a
            v-show="!editing"
            @click.prevent.stop="editSentence()"
          >
            <BIcon
              icon="pencil"
              size="is-small"
              class="example__icon"
            />
          </a>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <a @click.prevent.stop="deleteThisExample()">
            <BIcon
              icon="delete"
              size="is-small"
              class="example__icon"
            />
          </a>
        </div>
      </div>
    </div>
    <div slot="body">
      <ExampleInfo
        v-if="!editing"
        :entitiesList="entities"
        :highlighted.sync="highlighted"
        :intent="intent"
      />

      <EditExample
        v-else
        :entities="entitiesList"
        :intentToEdit="intent"
        :editExample="availableToExample"
        :textToEdit="text"
        :sentenceId="id"
        :languageEdit="language"
        :getAllEntities="allEntities"
        @cancel="cancelEditSentence"
        @saveList="updateList"
      />
    </div>
  </SentenceAccordion>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { getEntityColor } from '@/utils/entitiesColors';
import ExampleInfo from '@/components/shared/accordion/ExampleInfo';
import EditExample from '@/components/shared/accordion/EditExample';
import SentenceAccordion from '@/components/shared/accordion/SentenceAccordion';
import HighlightedText from '@/components/shared/HighlightedText';
import LanguageBadge from '@/components/shared/LanguageBadge';
import WordSuggestionButton from '@/components/shared/WordSuggestionButton';

export default {
  name: 'ExampleAccordion',
  components: {
    SentenceAccordion,
    ExampleInfo,
    EditExample,
    HighlightedText,
    LanguageBadge,
    WordSuggestionButton,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      default: '',
    },
    allEntities: {
      type: Array,
      default: () => [],
    },
    availableToExample: {
      type: Boolean,
      default: false,
    },
    entities: {
      type: Array,
      default: /* istanbul ignore next */ () => [],
    },
    intent: {
      type: String,
      default: '',
    },
    training: {
      type: Boolean,
      default: false,
    },
    language: {
      type: String,
      default: '',
    },
    pendingExample: {
      type: Boolean,
      default: false,
    },
    open: {
      type: Boolean,
      default: false,
    },
    suggestion: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isOpen: false,
      deleteDialog: null,
      editing: false,
      highlighted: null,
    };
  },
  computed: {
    ...mapState({
      repository: (state) => state.Repository.selectedRepository,
    }),
    entitiesList() {
      return this.entities.map((entity) => ({
        class: this.getEntityClass(entity.entity),
        ...entity,
      }));
    },
    sentenceDetail() {
      const detail = {
        id: this.id,
        text: this.text,
        intent: this.intent,
        language: this.language,
      };
      return detail;
    },
  },
  watch: {
    open() {
      this.isOpen = this.open;
    },
    isOpen() {
      if (!this.isOpen) {
        this.cancelEditSentence();
      }
      this.$emit('update:open', this.isOpen);
    },
  },
  methods: {
    ...mapActions(['deleteEvaluateExample', 'deleteExample']),
    getEntityClass(entity) {
      const allEntitiesName = this.repository.entities.map(
        (entityValue) => entityValue.value,
      );
      const color = getEntityColor(entity, allEntitiesName);
      return `entity-${color}`;
    },
    deleteThisExample() {
      this.deleteDialog = this.$buefy.dialog.confirm({
        title: this.$t('webapp.trainings.delete_phrase_modal_title'),
        message: this.$t('webapp.trainings.delete_phrase_modal'),
        confirmText: this.$t('webapp.trainings.delete_button'),
        cancelText: this.$t('webapp.trainings.cancel_button'),
        type: 'is-danger',
        onConfirm: async () => {
          if (this.training) {
            await this.deleteExample({ id: this.id });
            this.$emit('deleted');
          } else {
            await this.deleteEvaluateExample({
              id: this.id,
              repositoryUuid:
                this.$store.state.Repository.selectedRepository.uuid,
            });
            this.$emit('deleted');
          }
        },
      });
    },
    cancelEditSentence() {
      this.editing = false;
    },
    editSentence() {
      this.editing = true;
      this.isOpen = true;
    },
    updateList() {
      this.$emit('updateList');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';

.example__icon {
  color: $color-grey-dark;
}
.example-accordion {
  &__text {
    max-width: 100%;
  }

  &__tag {
    margin-right: 0.5rem;
  }

  &__btns-wrapper {
    display: flex;
    justify-content: flex-end;
  }

  &__suggestion {
    margin-top: 2px;
    margin-right: 6px;
  }
}
</style>
