<template>
  <div class="badges-container">
    <IntentTag
      v-for="item in list"
      :key="item.value"
      :entityName="item.value"
      :intentCount="false"
      class="badges-container__badge"
      @click.native="addIntents(item.value, item.id)"
    />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import IntentTag from '@/components/repository/repository-evaluate/example/IntentTag';

export default {
  name: 'BadgesIntentsSuggestion',
  components: {
    IntentTag,
  },
  props: {
    repository: {
      type: Object,
      default: null,
    },
    list: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      selectedIntent: '',
    };
  },
  methods: {
    ...mapActions(['getIntentSuggestion']),
    checkselectedIntent(intent) {
      if (intent === this.selectedIntent) {
        return true;
      }
      return false;
    },
    async addIntents(intent, id) {
      this.$emit('dispatchLoading', intent);
      this.selectedIntent = intent;
      const { data } = await this.getIntentSuggestion({
        id,
        language: this.repository.language,
      });
      this.$emit('phraseSuggestion', data.suggestions);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/variables.scss';
@import '~@/assets/scss/colors.scss';

.badges-container {
  padding-top: 0.75rem;
  margin-bottom: 3rem;

  &__badge {
    height: 41px !important;
    margin: 0.4rem 0.5rem 0 0;
    padding: 0 1rem 0 1rem;
    line-height: calc(1.5rem - 4px);
    cursor: pointer;

    span {
      font-size: $font-small;
      font-family: $font-family;
      font-weight: $font-weight-normal;
    }
  }
}
</style>
