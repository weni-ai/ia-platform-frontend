<template>
  <div class="token-item">
    <div class="token-item__info">
      <LanguageBadge
        :language="language"
        class="token-item__badge"
      />
      <div class="token-item__version">{{ repository_version__name }}</div>
    </div>
    <BField class="token-item__field">
      <BInput
        :value="url"
        expanded
        readonly
      />
      <BButton
        class="token-item__button"
        iconRight="content-copy"
        @click="copy()"
      />
      <BButton
        class="token-item__button"
        iconRight="close-thick"
        @click="deleteToken()"
      />
    </BField>
  </div>
</template>

<script>
import LanguageBadge from '@/components/shared/LanguageBadge';

export default {
  name: 'TranslateTokenListItem',
  components: {
    LanguageBadge,
  },
  props: {
    uuid: {
      type: String,
      required: true,
    },
    urlGenerator: {
      type: Function,
      required: true,
    },
    repository_version__name: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
  },
  computed: {
    url() {
      return this.urlGenerator(this.uuid);
    },
  },
  methods: {
    copy() {
      navigator.clipboard.writeText(this.url);
      this.$buefy.toast.open({
        message: this.$t('webapp.layout.copied'),
        type: 'is-success',
      });
    },
    deleteToken() {
      this.$emit('dispatchEvent', { event: 'deleted', value: this.uuid });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';

.token-item {
  padding: 0.5rem 0;
  display: grid;
  grid-template-columns: 1fr 2.5fr;

  &__info {
    display: flex;
    align-items: center;
    > * {
      margin-right: 1rem;
    }
  }

  &__version {
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 5rem;
  }

  &__button {
    color: $color-white;
    background-color: $color-grey;
    margin-left: 0.5rem;
  }
}
</style>
