<template>
  <div class="translation-sentence-status">
    <TranslationStatsCard
      v-for="status in statusInfo"
      :key="status.key"
      :count="status.count || 0"
      :disabled="status.count == null"
      :label="status.label"
      :active="active === status.key"
      clickable
      size="medium"
      class="translation-sentence-status__card"
      @click="onClick(status.key, status.query)"
    />
  </div>
</template>

<script>
import TranslationStatsCard from '@/components/shared/TranslationStatsCard';
import { mapActions } from 'vuex';

export default {
  name: 'TranslationSentenceStatus',
  components: { TranslationStatsCard },
  props: {
    externalToken: {
      type: String,
      default: null,
    },
    repositoryUuid: {
      type: String,
      default: null,
    },
    version: {
      type: Number,
      default: null,
    },
    language: {
      type: String,
      default: null,
    },
    toLanguage: {
      type: String,
      default: null,
    },
    initialData: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      active: this.initialData || 'all',
      update: null,
      statusData: {
        sentences: {
          key: 'all',
          label: this.$t('webapp.translate.sentences'),
          count: null,
          query: {},
        },
        translated: {
          key: 'translated',
          label: this.$t('webapp.translate.translated'),
          count: null,
          query: { has_translation_to: this.toLanguage },
        },
        not_translated: {
          key: 'not_translated',
          label: this.$t('webapp.translate.not_translated'),
          count: null,
          query: { has_not_translation_to: this.toLanguage },
        },
        inconsistent: {
          key: 'inconsistent',
          label: this.$t('webapp.translate.inconsistent'),
          count: null,
          query: {
            has_invalid_entities: this.toLanguage,
            has_translation_to: this.toLanguage,
          },
        },
      },
    };
  },
  computed: {
    statusInfo() {
      return Object.values(this.statusData);
    },
  },
  watch: {
    repositoryUuid() {
      this.getStatusData();
    },
    version() {
      this.getStatusData();
    },
  },
  mounted() {
    this.initialStatus();
    this.update = setTimeout(() => {
      this.getStatusData();
    }, 2000);
  },
  beforeDestroy() {
    clearTimeout(this.update);
  },
  methods: {
    ...mapActions(['searchExamples', 'searchExamplesExternal']),
    onClick(key, query) {
      const sendQuery = this.externalToken
        ? query
        : { language: this.language, ...query };
      this.$emit('search', { key, query: sendQuery });
      this.active = key;
    },
    initialStatus() {
      this.active = 'all';
      this.$emit('search', { key: 'all', query: {} });
    },
    async getStatusData() {
      if (!(this.externalToken || (this.repositoryUuid && this.version)))
        return;
      Object.entries(this.statusData).forEach(([key, value]) => {
        try {
          this.searchExamplesAction(value.query).then((list) =>
            list.updateItems(1).then(() => {
              this.statusData[key].count = list.total;
            }),
          );
        } catch (e) {
          this.statusData[key].count = null;
        }
      });
    },
    searchExamplesAction(query) {
      if (this.externalToken) {
        return this.searchExamplesExternal({
          limit: 1,
          token: this.externalToken,
          query,
        });
      }
      return this.searchExamples({
        limit: 1,
        repositoryUuid: this.repositoryUuid,
        version: this.version,
        query: { language: this.language, ...query },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.translation-sentence-status {
  display: flex;
  flex-wrap: wrap;
  > * {
    margin-right: 1rem;
    margin-bottom: 1rem;
  }
  &__card {
    border: 1px solid $color-border;
    padding: 1rem 3rem;
  }
}
</style>
