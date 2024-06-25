<template>
  <UnnnicSelectSmart
    :value="[
      finalOptions.find(({ value: insideValue }) => insideValue === value),
    ]"
    @input="$emit('input', $event[0].value)"
    :options="finalOptions"
    orderedByIndex
    autocomplete
    autocompleteClearOnFocus
    v-bind="$attrs"
  />
</template>

<script>
export default {
  props: {
    value: String,

    placeholder: {
      type: String,
      default: '',
    },

    options: Array,
  },

  computed: {
    finalOptions() {
      return [{ value: '', label: this.placeholder }].concat(
        this.options.map((value) => ({ value, label: value })),
      );
    },
  },
};
</script>
