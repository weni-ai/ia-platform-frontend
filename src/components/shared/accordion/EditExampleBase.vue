<script>
import Vue from 'vue';
import { mapState, mapActions, mapGetters } from 'vuex';
import { getEntityColor } from '@/utils/entitiesColors';
import { formatters, LANGUAGES } from '@/utils';


export default {
  name: 'EditExampleBase',
  props: {
    textToEdit: {
      type: String,
      default: '',
    },
    getAllEntities: {
      type: Array,
      default: () => ([]),
    },
    entities: {
      type: Array,
      default: () => ([]),
    },
    intentToEdit: {
      type: String,
      default: '',
    },
    languageEdit: {
      type: String,
      default: '',
    },
    editExample: {
      type: Boolean,
      default: false,
    },
    sentenceId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      errors: {},
      textSelected: null,
      text: JSON.parse(JSON.stringify(this.textToEdit)),
      intent: JSON.parse(JSON.stringify(this.intentToEdit)),
      language: JSON.parse(JSON.stringify(this.languageEdit)),
      entitiesToEdit: JSON.parse(JSON.stringify(this.entities)),
      pendingEntities: [],
      submitting: false,
    };
  },
  computed: {
    ...mapState({
      repository: state => state.Repository.selectedRepository
    }),
    ...mapGetters({
      version: 'getSelectedVersion',
    }),
    validationErrorsString() {
      if (!this.validationErrors) return '';
      return this.validationErrors.join(',');
    },
    filterIntents() {
      return (this.repository.intents_list || []).filter(intent => intent
        .startsWith(this.intent.toLowerCase()));
    },
    allEntities() {
      return [...this.entitiesToEdit, ...this.pendingEntities];
    },
    validationErrors() {
      const errors = [];

      if (!this.text) {
        errors.push('You need type a text to sentence');
      }

      if (!this.intent) {
        errors.push('Intent is required');
      }

      return errors;
    },
    isValid() {
      return this.validationErrors.length === 0;
    },
    entityButtonText() {
      if (this.textSelected === null) {
        return this.$t('webapp.trainings.add_entity');
      }

      const selected = this.text.slice(this.textSelected.start, this.textSelected.end);

      return `${this.$t('webapp.trainings.add_entity_for')} "${selected}"`;
    },
    intentFormatters() {
      return formatters.bothubItemKey();
    },
    highlightedText() {
      return entity => this.text.slice(entity.start, entity.end);
    },
    languageList() {
      return Object.keys(LANGUAGES)
        .map(lang => ([lang, LANGUAGES[lang]]));
    },
  },
  watch: {
    text(newText, oldText) {
      if (newText !== oldText) {
        this.recomputeEntitiesFor(newText, oldText);
      }
    },
  },
  methods: {
    ...mapActions([
      'updateEvaluateExample',
      'editSentence',
    ]),
    filterEntities(index, isPending) {
      if (this.getAllEntities !== null) {
        return this.getAllEntities.filter(entity => entity
          .startsWith(isPending
            ? this.pendingEntities[index].entity.toLowerCase()
            : this.entitiesToEdit[index].entity.toLowerCase()));
      }
      return [];
    },
    cancelEditSentence() {
      this.$emit('cancel');
    },
    setTextSelected(value) {
      this.textSelected = value;
    },
    removeEntity(entity, index) {
      this.$nextTick(() => {
        Vue.delete(this.entitiesToEdit, index);
      });
    },
    removePendingEntity(entity, index) {
      this.$nextTick(() => {
        Vue.delete(this.pendingEntities, index);
      });
    },
    addPendingEntity() {
      // It will be added at the end of the list, so we already know its index.
      const newEntity = {
        start: this.textSelected.start,
        end: this.textSelected.end,
        entity: this.intentFormatters(
          this.text.substring(this.textSelected.start, this.textSelected.end),
        ),
      };

      this.pendingEntities.push({
        ...newEntity,
        class: '',
      });

      this.textSelected = null;
      this.onEntityAdded();
    },
    elevateToEntity(entity, index) {
      const color = getEntityColor(
        entity,
      );

      const entityObject = entity;
      entityObject.class = color;

      this.entitiesToEdit.push(entityObject);
      this.onEntityAdded();
      this.removePendingEntity(entity, index);
    },
    onEditEntity(entity) {
      if (this.$refs.textInput.emitTextSelected) {
        /* istanbul ignore next */
        this.$refs.textInput.emitTextSelected({
          selectionStart: entity.start,
          selectionEnd: entity.end,
        });
      }
    },
    recomputeEntitiesFor(text, oldText) {
      /*
        Entity follow text,
        based in https://github.com/RasaHQ/rasa-nlu-trainer/blob/master/src/components-v1/TextEditor.js
      */
      this.entitiesToEdit.forEach((entity, i) => {
        const oldEntityText = oldText.substring(entity.start, entity.end);

        const findClosestStart = (lastMatch) => {
          if (lastMatch === undefined) {
            const index = text.indexOf(oldEntityText);
            return index === -1
              ? index
              : findClosestStart(index);
          }

          const from = lastMatch + oldEntityText.length;
          const index = text.indexOf(oldEntityText, from);

          if (index === -1) {
            return lastMatch;
          }

          const prevDiff = Math.abs(entity.start - lastMatch);
          const nextDiff = Math.abs(entity.start - index);

          return prevDiff < nextDiff
            ? lastMatch
            : findClosestStart(index);
        };

        const start = findClosestStart();
        if (start === -1) {
          this.entitiesToEdit[i] = false;
          return false;
        }

        this.entitiesToEdit[i].start = start;
        this.entitiesToEdit[i].end = start + oldEntityText.length;
        return true;
      });
      this.entitiesToEdit = this.entitiesToEdit.filter(value => !!value);
    },
    onEntityAdded() {
      if (this.$refs.textInput.clearSelected) {
        /* istanbul ignore next */
        this.$refs.textInput.clearSelected();
      }
    },
    async onSubmit() {
      this.errors = {};
      this.submitting = true;

      const entitiesResponse = this.allEntities.map((entityValue) => {
        const { start, end, entity } = entityValue;
        return { start, end, entity };
      });

      try {
        if (this.editExample) {
          await this.editSentence({
            repository: this.repository.uuid,
            id: this.sentenceId,
            version: this.version,
            text: this.text,
            intent: this.intent,
            entities: entitiesResponse,
            language: this.language,
          });
        } else {
          await this.updateEvaluateExample({
            repository: this.repository.uuid,
            id: this.sentenceId,
            version: this.version,
            text: this.text,
            intent: this.intent,
            entities: this.allEntities,
            language: this.language,
          });
        }

        this.$emit('saveList');
        return true;
      } catch (error) {
        this.errors.intent = [error.message];

        /* istanbul ignore next */
        const data = error.response && error.response.data;
        /* istanbul ignore next */
        if (data) {
          /* istanbul ignore next */
          this.errors = data;
        }
        /* istanbul ignore next */
        this.submitting = false;
      }
      return false;
    },
  },
};
</script>
