<template>
  <fetch-choice-input
    v-if="fetch"
    :fetch="fetch"
    :label-placeholder="labelPlaceholder"
    v-model="value"
    @input="update()"/>
  <Autocomplete
    v-else-if="compact"
    :value="value"
    :placeholder="labelPlaceholder"
    :data="filteredChoices"
    @input="update($event)"
    entityFormat
    />
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
import Autocomplete from '../../Autocomplete.vue';

export default {
  components: {
    FetchChoiceInput,
    Autocomplete,
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
      default: '',
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
      return this.choices.map((choice) =>
        formatters.bothubItemKey()(choice.display_name.toLowerCase()),
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
    this.update(this.value);
  },
  methods: {
    update(value) {
      this.value = value;
      this.$emit('input', this.value);
    },
  },
};
</script>
