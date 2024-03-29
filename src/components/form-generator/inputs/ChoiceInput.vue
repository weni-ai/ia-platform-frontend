<template>
  <fetch-choice-input
    v-if="fetch"
    :fetch="fetch"
    :label-placeholder="labelPlaceholder"
    v-model="value"
    @input="update()"/>
  <unnnic-autocomplete
    v-else-if="compact"
    v-model="value"
    :placeholder="labelPlaceholder"
    :custom-formatter="formatter"
    :data="filteredChoices"
    dropdown-position="bottom"
    openWithFocus
    @input="updateInput"
    @choose="selectOption"/>
  <unnnic-select
    v-else
    v-model="value"
    @input="update()">
    <option
      v-for="choice in choices"
      :key="choice.value"
      :value="choice.value">{{ choice.display_name }}</option>
  </unnnic-select>
</template>

<script>
import { formatters } from '@/utils';
import FetchChoiceInput from './FetchChoiceInput';

export default {
  components: {
    FetchChoiceInput,
  },
  props: {
    choices: {
      type: Array,
      default: () => [],
    },
    fetch: {
      type: Function,
      default: null,
    },
    initialData: {
      type: [Array, String],
      default: null,
    },
    compact: {
      type: Boolean,
      default: null,
    },
    labelPlaceholder: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      value: this.initialData,
      formatter: choice => choice.display_name,
    };
  },
  computed: {
    filteredChoices() {
      if (!this.value || this.value.length === 0) { return this.choices; }
      const search = new RegExp(formatters.bothubItemKey()(this.value.toLowerCase()));
      return this.choices
        .filter(
          choice => search.test(formatters.bothubItemKey()(choice.display_name.toLowerCase())),
        );
    },
  },
  mounted() {
    this.update();
  },
  methods: {
    updateInput() {
      const search = formatters.bothubItemKey()(this.value.toLowerCase());
      const option = this.choices.find(
        choice => formatters.bothubItemKey()(choice.display_name.toLowerCase())
                    === search,
      );
      if (option) {
        this.$emit('input', option.value);
      } else {
        this.$emit('input', '');
      }
    },
    selectOption(option) {
      if (option) {
        this.$emit('input', option.value);
      } else {
        this.$emit('input', '');
      }
    },
    update() {
      this.$emit('input', this.value);
    },
  },
};
</script>
