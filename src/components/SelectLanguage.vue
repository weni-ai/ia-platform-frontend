<template>
  <UnnnicSelectSmart
    :value="[languageList.find(({ value }) => value === language)]"
    @input="$emit('input', $event[0].value)"
    :options="languageList"
    orderedByIndex
    v-bind="$attrs"
  />
</template>

<script>
import { LANGUAGES } from '@/utils';

export default {
  model: {
    prop: 'language',
  },

  props: {
    language: String,

    placeholder: {
      type: String,
      default: '',
    },
  },

  computed: {
    languageList() {
      return [
        {
          value: '',
          label: this.placeholder,
        },
      ].concat(
        Object.keys(LANGUAGES).map((lang) => ({
          value: lang,
          label: LANGUAGES[lang],
        })),
      );
    },
  },
};
</script>
