<template>
  <div class="word-suggestion-accordion">
    <BField
      v-if="editing"
      class="word-suggestion-accordion__field"
    >
      <BInput
        v-model="suggestionWord"
        size="is-small"
      />
    </BField>

    <div
      v-else
      class="word-suggestion-accordion__phrase"
    >
      <p>{{ suggestionWord }}</p>
    </div>

    <div class="word-suggestion-accordion__icons">
      <BIcon
        v-if="editing"
        icon="check-bold"
        size="is-small"
        class="text-color-grey-dark word-suggestion-accordion__icons__icon"
        @click.native="saveEdition()"
      />
      <BIcon
        v-else
        icon="pencil"
        size="is-small"
        class="text-color-grey-dark word-suggestion-accordion__icons__icon"
        @click.native="editPhrase()"
      />
      <BIcon
        icon="delete"
        size="is-small"
        class="text-color-grey-dark word-suggestion-accordion__icons__icon"
        @click.native="deletePhrase()"
      />
    </div>
  </div>
</template>

<script>
// import ExampleAccordion from '../../../components/shared/accordion/ExampleAccordion.vue';

export default {
  name: 'WordSuggestion',
  components: {
    ExampleAccordion: () =>
      import('../../../components/shared/accordion/ExampleAccordion.vue'),
  },
  props: {
    text: {
      type: String,
      default: '',
    },
    repository: {
      type: Object,
      default: /* istanbul ignore next */ () => ({}),
    },
  },
  data() {
    return {
      open: false,
      suggestionWord: '',
      editing: false,
    };
  },
  computed: {
    allEntities() {
      return this.repository.entities.map((entityValue) => entityValue.value);
    },
  },
  mounted() {
    this.updateText();
  },
  methods: {
    updateText() {
      this.suggestionWord = this.text;
    },
    editPhrase() {
      this.editing = !this.editing;
    },
    deletePhrase() {
      this.$emit('deleted');
    },
    saveEdition() {
      this.$emit('updateList', this.suggestionWord);
      this.editing = false;
    },
  },
};
</script>
<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';

.word-suggestion-accordion {
  width: 100%;
  height: 40px;
  margin: 0.4rem 0;
  background: $color-fake-white;
  border: 1px solid $color-border;

  display: flex;
  justify-content: space-between;
  align-items: center;

  &__field {
    width: 55%;
    margin-top: 0.69rem;
    margin-left: 1rem;
  }

  &__phrase {
    margin-left: 1rem;
    p {
      white-space: nowrap;
      width: 32rem;
      overflow: hidden;
      text-overflow: ellipsis;
      @media screen and (max-width: $mobile-width) {
        width: 12rem;
      }
    }
  }

  &__icons {
    margin-right: 1rem;
    width: 8%;
    display: flex;
    justify-content: space-between;

    &__icon {
      cursor: pointer;
      color: $color-grey-dark;
      &:hover {
        color: $color-fake-grey;
        transition: 1s;
      }
    }
  }
}
</style>
