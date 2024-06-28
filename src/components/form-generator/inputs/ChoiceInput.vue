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
  <unnnic-select-smart
    v-else
    :value="choicesSelectSmart.value"
    :options="choicesSelectSmart.options"
    @input="update($event[0].value)"
  ></unnnic-select-smart>
</template>

<script>
import { formatters, useSelectSmart } from '@/utils';
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

    choicesSelectSmart() {
      return useSelectSmart({
        from: this.choices,
        value: 'value',
        label: 'display_name',
        placeholder: '',
        currentValue: this.value,
      });
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
    update(value) {
      this.value = value;
      this.$emit('input', this.value);
    },
  },
};
</script>
