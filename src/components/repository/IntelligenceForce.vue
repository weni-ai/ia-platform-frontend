<template>
  <div class="intelligence-force">
    <div class="intelligence-force__title">
      <UnnnicCard
        type="title"
        :title="$t('webapp.summary.intelligence_force')"
        :hasInformationIcon="true"
        icon="fitness-biceps-1"
        :info="$t('webapp.summary.intelligence_force_info')"
        infoPosition="left"
      />
    </div>
    <div class="intelligence-force__chart-wrapper">
      <UnnnicChartRainbow
        :value="+intelligenceForce"
        :description="relevanceProgress"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'IntelligenceForce',
  computed: {
    ...mapGetters(['getCurrentRepository']),
    intelligenceForce() {
      const scoreObject = this.getCurrentRepository.repository_score;
      const scoreResult =
        (scoreObject.evaluate_size_score +
          scoreObject.intents_balance_score +
          scoreObject.intents_size_score) /
        3;
      return scoreResult.toFixed(0);
    },
    relevanceProgress() {
      if (this.intelligenceForce <= 33) {
        return this.$t('webapp.summary.intelligence_force_low');
      }
      if (this.intelligenceForce >= 34 && this.intelligenceForce <= 63) {
        return this.$t('webapp.summary.intelligence_force_regular');
      }
      if (this.intelligenceForce >= 64 && this.intelligenceForce <= 100) {
        return this.$t('webapp.summary.intelligence_force_high');
      }

      return '';
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';
@import '~@weni/unnnic-system/dist/unnnic.css';
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.intelligence-force {
  display: flex;
  flex-direction: column;
  flex: 1;

  &__title {
    margin-bottom: $unnnic-spacing-md;
  }
  :deep(.unnnic-tooltip-label) {
    $large-tooltip-width: 26.875 * $unnnic-font-size;

    max-width: $large-tooltip-width;
  }

  &__chart-wrapper {
    display: flex;
    justify-content: center;
    margin-top: $unnnic-spacing-md;
  }
}
</style>
