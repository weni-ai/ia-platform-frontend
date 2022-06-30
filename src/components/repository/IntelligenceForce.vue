<template>
  <div class="intelligence-force">
    <div class="intelligence-force__title">
      <unnnic-card
        type="title"
        :title="$t('webapp.summary.intelligence_force')"
        :hasInformationIcon="true"
        icon="fitness-biceps-1"
        :info="$t('webapp.summary.intelligence_force_info')"
        infoPosition="left"
      />
    </div>
      <div class="intelligence-force__chart-wrapper">
        <unnnic-chart-rainbow :value="+intelligenceForce" :description="relevanceProgress" />
      </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'IntelligenceForce',
  computed: {
    ...mapGetters([
      'getCurrentRepository',
    ]),
    intelligenceForce() {
      const scoreObject = this.getCurrentRepository.repository_score;
      const scoreResult = (scoreObject.evaluate_size_score
      + scoreObject.intents_balance_score + scoreObject.intents_size_score) / 3;
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
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

 /deep/ .number {
    align-items: unset;
    background-color: unset;
    border-radius: 0;
    display: unset;
    height: 0;
    justify-content: unset;
    margin-right: 0;
    min-width: unset;
    padding: 0;
    text-align: unset;
   vertical-align: bottom;
 }

.intelligence-force{
        display: flex;
        flex-direction: column;
        // justify-content: center;
        // padding-left: 3rem;
        // margin-top: .8rem;
        // margin-left: 0.5rem;
        // border: 1px solid $color-border;
        width: 50%;
        // height: 75px;

        &__title{
            // display: flex;
            font-size: 1.75rem;
            margin-bottom: 1.2rem;
          h2 {
            font-family: $font-family;
            color: $color-fake-black;
            margin-bottom:0.6rem;
            font-weight: $font-weight-medium;
            margin-right: 0.6rem;
          }
        }


    &__relevance {
      display: flex;
      margin-bottom: 4rem;

      &__progress {
        height: 20px;
        width: 100%;
        background-color: #EAEAEA;
        box-shadow: 0px 3px 6px #00000029;
      }
      &__bar-field {
        background: linear-gradient(to right, #00ded2 0%, $color-primary-dark 100%);
        height: 20px;
        width: 15px;

        &__icon{
          float: right;
        }
      }
      &__division{
        display:flex;
        width: 42%;
        position:absolute;

        &__stripe{
          border: 2px solid $color-white;
          height: 20px;
          margin-left: 16%;
        }
      }
    }
    &__chart-wrapper{
      display: flex;
      justify-content: center;
      margin-top: 2rem;
    }
    @media screen and (max-width: 45em) {
        h2{
            font-size: 1.4rem;
        }
    }
}
  /deep/ .unnnic-chart-rainbow .content .description {
    font-size: $unnnic-font-size-title-sm;
  }
  /deep/ .unnnic-card-title .title {
    margin-bottom: 0;
  }
  /deep/ .unnnic-tooltip-label {
    max-width: 430px;
  }

</style>
