<template>
  <div class="intent-suggestion-list">
    <div v-if="phraseList.total !== 0">
      <p>
        Selecione a frase que deseja utilizar como base para gerar outras
        frases.
      </p>
      <EditIntentSuggestion
        :perPage="perPage"
        :phrasesVariation="phraseList"
        @dispatchSelected="dispatchSelected"
      />
    </div>
    <div v-else>
      <p class="intent-suggestion-list__empty">
        {{ $t('webapp.phrase-suggestion.empty') }}
      </p>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import IntentModalEdition from '@/components/repository/IntentModalWithEdition';
import EditIntentSuggestion from '@/components/repository/EditIntentSuggestion';

export default {
  name: 'IntentSuggestionList',
  components: {
    IntentModalEdition,
    EditIntentSuggestion,
  },
  props: {
    phraseList: {
      type: Object,
      default: null,
    },
    repository: {
      type: Object,
      default: null,
    },
    intent: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      select: '',
      selectAll: false,
      perPage: 10,
    };
  },
  computed: {
    ...mapGetters({
      editStatus: 'getEditingStatus',
      selectedSuggestions: 'getSelectedSuggestion',
      repositoryVersion: 'getSelectedVersion',
      repositoryUUID: 'getCurrentRepository',
    }),
  },
  watch: {
    select() {
      this.$root.$emit('selectAll', this.select);
    },
  },
  methods: {
    ...mapActions([
      'newEvaluateExample',
      'newExample',
      'clearSelectedSuggestion',
    ]),
    confirmEdit() {
      this.$root.$emit('confirmEdit');
    },
    cancelEdit() {
      this.$root.$emit('cancelEdit');
    },
    addToTraining() {
      if (this.selectedSuggestions.length === 0) {
        this.$buefy.toast.open({
          message: this.$t('webapp.inbox.select_phrase'),
          type: 'is-danger',
        });
        return;
      }
      this.selectedSuggestions.map(async (example) => {
        try {
          await this.newExample({
            text: example.text,
            intent: this.intent,
            entities: [],
            isCorrected: false,
            repositoryVersion: this.repositoryVersion,
            language: this.repository.language,
            repository: this.repositoryUUID.uuid,
          });
          this.$buefy.toast.open({
            message: `${example.text.bold()} ${this.$t(
              'webapp.inbox.entry_has_add_to_train',
            )}`,
            type: 'is-success',
          });
        } catch (error) {
          this.showError(error, example);
        } finally {
          this.select = false;
          this.clearSelectedSuggestion();
        }
      });
    },
    addToSentences() {
      if (this.selectedSuggestions.length === 0) {
        this.$buefy.toast.open({
          message: this.$t('webapp.inbox.select_phrase'),
          type: 'is-danger',
        });
        return;
      }
      this.selectedSuggestions.map(async (example) => {
        try {
          await this.newEvaluateExample({
            text: example.text,
            intent: this.intent,
            entities: [],
            isCorrected: false,
            repositoryVersion: this.repositoryVersion,
            language: this.repository.language,
            repository: this.repositoryUUID.uuid,
          });
          this.$buefy.toast.open({
            message: `${example.text.bold()} ${this.$t(
              'webapp.inbox.entry_has_add_to_sentence',
            )}`,
            type: 'is-success',
          });
        } catch (error) {
          this.showError(error, example);
        } finally {
          this.select = false;
          this.clearSelectedSuggestion();
        }
      });
    },
    showError(error, example) {
      const messages = Object.values(error.response.data).map((errors) =>
        typeof errors === 'string' ? errors : Array.join(errors, ','),
      );
      const message = `${example.text.bold()}, ${Array.join(messages, ',')}`;
      this.$buefy.toast.open({
        message,
        type: 'is-danger',
      });
    },
    dispatchSelected(sentence) {
      this.$emit('dispatchSelected', sentence);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';

.intent-suggestion-list {
  &__pagination {
    margin-top: 1.25rem;
  }

  &__empty-message {
    margin: 2rem;
    text-align: center;
  }

  &__section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: $color-grey-dark;
    font-size: 1.1rem;
    font-weight: bold;
    margin-bottom: 2rem;
    width: 100%;
    float: right;

    &__check {
      margin-left: 1.6rem;
    }

    @media screen and (max-width: $mobile-width) {
      padding: 0.6rem;
    }

    &__buttonsIcon {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: row;
      > * {
        margin-left: 0.7rem;
      }
    }

    &__icon {
      width: 5.2rem;
      display: flex;
      justify-content: space-between;

      &__icon-style {
        width: 36px;
        height: 36px;
        color: white;
        border-radius: 4px;
        background-color: $color-primary-soft;
      }

      &__icon-style:hover {
        cursor: pointer;
        background-color: $color-primary;
      }
    }
  }
  &__empty {
    text-align: center;
  }
}
</style>
