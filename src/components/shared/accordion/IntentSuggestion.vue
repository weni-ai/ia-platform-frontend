<template>
  <div class="intent-suggestion-accordion">
    <div class="intent-suggestion-accordion__content">
      <div
        class="intent-suggestion-accordion__content__check-field">
        <span class="intent-suggestion-accordion__content__tag">[{{ repository.language }}]</span>
      </div>

      <div
        class="intent-suggestion-accordion__content__phrase">
        <p>{{ phraseSuggestion }}</p>
      </div>
    </div>

    <div class="intent-suggestion-accordion__icons">
        <unnnic-icon-svg
          icon="arrow-right-1-1"
          size="sm"
          @click.native="selectSentence"
        />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
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
    }

  },
  data() {
    return {
      open: false,
      phraseSuggestion: '',
      editing: false,
      checked: false,
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
    isAccordionOpen() {
      this.open = false;
    },
  },
  created() {
    this.$root.$on('selectAll', value => this.selectAll(value));
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
      this.changeSelectedSuggestion({ id: this.id, text: this.phraseSuggestion });
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
          language: this.language
        },
      });
    }
  },
};
</script>
<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.b-checkbox.checkbox:not(.button){
  margin-right: 0;
}

.intent-suggestion-accordion{
    &:last-child{
      margin-bottom: $unnnic-spacing-stack-xl;
    }

    width: 100%;
    // height: 40px;
    margin: 1rem 0;
    background: #FFFFFF;
    border: 1px solid #E2E6ED;
    border-radius: 8px;
    padding: $unnnic-spacing-stack-sm;

    display:flex;
    justify-content: space-between;
    align-items: center;


    &__content{
     width: 80%;
     display:flex;
     justify-content: flex-start;
     align-items: center;
     font-size: $unnnic-font-size-body-gt;

      &__check-field{
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }

      &__field{
          margin-left: 1rem;
          width: 50%;
          height: 100px;
          display: flex;
          justify-content: flex-start;
          align-items: center;

          &__input{
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
      }

      &__phrase{
        margin-left: 1rem;
          p {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
            @media screen and (max-width: $mobile-width) {
              width: 12rem;
            }
          }
      }

      &__tag {
        // margin-right: 0.5rem;
        font-weight: 900;
        // font-size: 14px;
        color: #d0d3d9;
      }

    }


    &__icons{
        margin-right: 1rem;
        cursor: pointer;
        display: flex;
        align-self: center;
    }

}
</style>
