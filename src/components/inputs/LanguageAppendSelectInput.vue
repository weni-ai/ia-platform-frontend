<template>
  <b-dropdown
    :scrollable="true"
    :position="dropdownDirection"
    :max-height="175"
    class="language-append-select-input">
    <span
      slot="trigger"
      class="clickable language-append-select-input__language-select">
      <language-badge
        v-if="val"
        :language="val" />
      <b-icon
        v-else
        class="language-icon language-icon__menu__no-val"
        size="is-small"
        icon="earth" />
      <b-icon
        class="clickable align language-icon language-icon__menu"
        size="is-small"
        icon="menu-down" />
    </span>
    <b-dropdown-item
      v-for="(verbose, language) in languageList"
      :key="language"
      @click="setVal(language)">
      <span>{{ verbose }}</span>
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
import { LANGUAGES, languageListToDict } from '@/utils';
import LanguageBadge from '@/components/shared/LanguageBadge';


export default {
  name: 'LanguageAppendSelectInput',
  components: {
    LanguageBadge,
  },
  props: {
    value: {
      type: String,
      default: null,
    },
    languages: {
      type: Array,
      default: null,
    },
    dropdownDirection: {
      type: String,
      default: 'is-bottom-left',
    },
  },
  data() {
    return {
      val: this.value,
      LANGUAGES,
    };
  },
  computed: {
    languageList() {
      if (!this.languages) return LANGUAGES;
      return languageListToDict(this.languages);
    },
  },
  watch: {
    value(value) {
      this.val = value;
    },
    val(value) {
      this.$emit('input', value);
    },
  },
  methods: {
    setVal(value) {
      this.val = value;
    },
  },
};
</script>

<style lang="scss">
.language-append-select-input {
  min-height: 30px;

  &__language-select {
    align-items: center;
  }
}

.language-icon {
  color: black !important;
  pointer-events: all !important;
  padding-bottom: 0.7rem;

  &__menu {
    width: 1rem !important;

    &__no-val {
      left: -1.5rem;
    }
  }
}
</style>
