<template>
  <UnnnicSelectSmart
    ref="autocomplete"
    :value="[
      finalOptions.find(({ value: insideValue }) => insideValue === value),
    ]"
    @input="$emit('input', $event[0].value)"
    :options="finalOptions"
    orderedByIndex
    autocomplete
    autocompleteClearOnFocus
    v-bind="$attrs"
  />\
</template>

<script>
import { formatters } from '../utils';

export default {
  props: {
    value: String,

    placeholder: {
      type: String,
      default: '',
    },

    options: Array,

    entityFormat: Boolean,
  },

  data() {
    return {
      createdValue: '',
    };
  },

  computed: {
    finalOptions() {
      const options = [{ value: '', label: this.placeholder }].concat(
        this.options.map((value) => ({ value, label: value })),
      );

      if (this.createdValue) {
        options.push({ value: this.createdValue, label: this.createdValue });
      }

      return options;
    },
  },

  methods: {
    formatOnBlur(event) {
      if (this.entityFormat) {
        let { value } = event.target;

        value =
          formatters.bothubItemKey()(value.toLowerCase()) || this.createdValue;

        this.$emit('input', value);

        this.createdValue = value;
      }
    },
  },

  mounted() {
    this.$refs.autocomplete.$el
      .querySelector('input')
      .addEventListener('blur', this.formatOnBlur);
  },

  beforeDestroy() {
    this.$refs.autocomplete.$el
      .querySelector('input')
      .removeEventListener('blur', this.formatOnBlur);
  },
};
</script>
