<template>
  <div class="translation-status-info">
    <TranslationStatsCard
      :disabled="!languages"
      :helpText="(languages || []).join(', ')"
      :count="(languages || []).length"
      :label="
        $tc('webapp.summary.information_language', (languages || []).length)
      "
      size="medium"
    />
    <TranslationStatsCard
      :disabled="!completedLanguages"
      :helpText="(completedLanguages || []).join(', ')"
      :count="(completedLanguages || []).length"
      :label="
        $tc('webapp.translate.completed', (completedLanguages || []).length)
      "
      size="medium"
    />
    <TranslationStatsCard
      :disabled="!translatorsList"
      :helpText="(translatorsList || []).join(', ')"
      :count="(translatorsList || []).length"
      :label="
        $tc('webapp.translate.translators', (translatorsList || []).length)
      "
      size="medium"
    />
  </div>
</template>

<script>
import TranslationStatsCard from '@/components/shared/TranslationStatsCard';
import { mapActions } from 'vuex';

export default {
  name: 'TranslationStatusInfo',
  components: {
    TranslationStatsCard,
  },
  props: {
    repositoryUuid: {
      type: String,
      default: null,
    },
    completedLanguages: {
      type: Array,
      default: null,
    },
    languages: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      translatorsList: null,
    };
  },
  watch: {
    repositoryUuid() {
      this.getTranslators();
    },
  },
  mounted() {
    this.getTranslators();
  },
  methods: {
    ...mapActions(['repositoryAuthorizationList']),
    async getTranslators() {
      if (!this.repositoryUuid) return;
      try {
        const authorizationsList = await this.repositoryAuthorizationList({
          repositoryUuid: this.repositoryUuid,
        });
        const list = await authorizationsList.getAllItems();
        this.translatorsList = list
          .filter((user) => user.level >= 2)
          .map((user) => user.user__nickname);
      } catch (e) {
        this.translatorsList = null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.translation-status-info {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  padding: 0.35rem 1.5rem;
  border: 1px solid $color-border;

  > * {
    margin-right: 1rem;
  }
}
</style>
