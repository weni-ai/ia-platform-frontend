<template>
  <div
    @click="selectSentence"
    @mouseenter="activeSentence(id)"
    @mouseleave="inactiveSentence(id)"
    class="intent-suggestion-accordion"
  >
    <div class="intent-suggestion-accordion__content">
      <div class="intent-suggestion-accordion__content__check-field">
        <span class="intent-suggestion-accordion__content__tag"
          >[{{ repository.language }}]</span
        >
      </div>

      <div class="intent-suggestion-accordion__content__phrase">
        <HighlightedEntity
          :ref="id"
          :id="id"
          :text="phraseSuggestion"
          :entities="entities"
          :state="isSentenceActive"
        />
      </div>
    </div>

    <div class="intent-suggestion-accordion__icons">
      <UnnnicIconSvg
        icon="arrow-right-1-1"
        size="sm"
        @click.native="selectSentence"
      />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import HighlightedEntity from '@/components/shared/HighlightedEntity';

export default {
  components: { HighlightedEntity },
  name: 'IntentSuggestion',
  props: {
    id: {
      type: Number,
      default: 0,
    },
    text: {
      type: String,
      default: '',
    },
    created_at: {
      type: String,
      default: '',
    },
    entities: {
      type: [Array, String],
      default: () => [],
    },
    intent: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      open: false,
      phraseSuggestion: '',
      editing: false,
      checked: false,
      isSentenceActive: false,
    };
  },
  computed: {
    ...mapGetters({
      repository: 'getCurrentRepository',
    }),
    toExample() {
      return {
        text: this.phraseSuggestion,
        id: this.id,
      };
    },
  },
  watch: {
    checked() {
      if (this.checked) {
        this.setSelectedSuggestion(this.toExample);
      } else {
        this.removeSelectedSuggestion(this.toExample);
      }
    },
  },
  created() {
    this.$root.$on('selectAll', (value) => this.selectAll(value));
    this.$root.$on('confirmEdit', () => this.saveEdit());
    this.$root.$on('cancelEdit', () => this.updateText());
  },
  mounted() {
    this.updateText();
  },
  methods: {
    ...mapActions([
      'setEditingStatus',
      'setSelectedSuggestion',
      'removeSelectedSuggestion',
      'changeSelectedSuggestion',
    ]),
    selectAll(value) {
      this.checked = value;
    },
    updateText() {
      this.phraseSuggestion = this.text;
      this.editing = false;
    },
    editPhrase() {
      this.editing = !this.editing;
      this.setEditingStatus(this.editing);
    },
    saveEdit() {
      this.changeSelectedSuggestion({
        id: this.id,
        text: this.phraseSuggestion,
      });
      this.editing = false;
      this.setEditingStatus(false);
    },
    selectSentence() {
      this.$emit('dispatchEvent', {
        event: 'onSentenceSelected',
        value: {
          id: this.id,
          text: this.phraseSuggestion,
          entities: this.entities,
          language: this.language,
        },
      });
    },
    activeSentence(id) {
      this.$refs[id].active = true;
    },
    inactiveSentence(id) {
      this.$refs[id].active = false;
    },
  },
};
</script>
<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';
@import '~@weni/unnnic-system/dist/unnnic.css';
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.b-checkbox.checkbox:not(.button) {
  margin-right: 0;
}

.intent-suggestion-accordion {
  width: 100%;
  // height: 40px;
  margin: 1rem 0;
  background: #ffffff;
  border: 1px solid #e2e6ed;
  border-radius: 8px;
  padding: $unnnic-spacing-stack-sm;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;

  &:last-child {
    margin-bottom: $unnnic-spacing-stack-xl;
  }

  &__content {
    width: 80%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-size: $unnnic-font-size-body-gt;

    &__check-field {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    &__field {
      margin-left: 1rem;
      width: 50%;
      height: 100px;
      display: flex;
      justify-content: flex-start;
      align-items: center;

      &__input {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }

    &__phrase {
      margin-left: 1rem;
      font-size: $unnnic-font-size-body-gt;
    }

    &__tag {
      // margin-right: 0.5rem;
      font-weight: 900;
      // font-size: 14px;
      color: #d0d3d9;
    }
  }

  &__icons {
    margin-right: 1rem;
    cursor: pointer;
    display: flex;
    align-self: center;
  }
  :deep(.highlighted-text--size-normal) {
    font-size: $unnnic-font-size-body-gt;
  }
}
</style>
