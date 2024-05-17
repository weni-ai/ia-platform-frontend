<template>
  <div class="summary-information">
    <div class="summary-information__info">
      <UnnnicCard
        type="title"
        :title="$t('webapp.summary.general_information')"
        :hasInformationIcon="false"
        icon="gauge-dashboard-2"
        scheme="aux-purple"
      />
      <!-- <span class="summary-information__info__title">
        {{ $t('webapp.summary.general_information') }}
      </span> -->
      <div class="summary-information__info__container">
        <UnnnicCardNumber
          class="summary-information__info__container__item--clickable"
          :description="
            $tc(
              'webapp.summary.information_sentences',
              getCurrentRepository.examples__count,
            )
          "
          :number="getCurrentRepository.examples__count"
          clickable
          @click.native="navigateToSentences"
          fullSize
        />

        <UnnnicCardNumber
          class="summary-information__info__container__item--clickable"
          :description="
            $tc(
              'webapp.summary.information_intents',
              getCurrentRepository.intents_list.length,
            )
          "
          :number="getCurrentRepository.intents_list.length"
          clickable
          @click.native="scrollToIntent"
          fullSize
        />

        <UnnnicCardNumber
          class="summary-information__info__container__item--clickable"
          :description="
            $tc(
              'webapp.summary.information_entities',
              getCurrentRepository.entities.length,
            )
          "
          :number="getCurrentRepository.entities.length"
          clickable
          @click.native="scrollToEntity"
          fullSize
        />

        <UnnnicToolTip
          side="bottom"
          :text="languagesList"
          enabled
          maxWidth="15rem"
        >
          <UnnnicCardNumber
            :description="
              $tc(
                'webapp.summary.information_language',
                getCurrentRepository.available_languages.length,
              )
            "
            :number="getCurrentRepository.available_languages.length"
            fullSize
          />
        </UnnnicToolTip>

        <UnnnicToolTip
          side="bottom"
          :text="contributorsList"
          enabled
          maxWidth="15rem"
        >
          <UnnnicCardNumber
            :description="
              $tc(
                'webapp.summary.information_contributors',
                getCurrentRepository.authorizations.count,
              )
            "
            :number="getCurrentRepository.authorizations.count"
            fullSize
          />
        </UnnnicToolTip>

        <UnnnicCardNumber
          :description="
            $tc(
              'webapp.summary.information_integrations',
              getCurrentRepository.count_authorizations,
            )
          "
          :number="getCurrentRepository.count_authorizations"
          fullSize
        />
      </div>
    </div>
    <IntelligenceForce />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { languageListToDict } from '@/utils';
import NumbersCard from '@/components/shared/NumbersCard';
import IntelligenceForce from '@/components/repository/IntelligenceForce';

export default {
  name: 'SummaryInformation',
  components: {
    NumbersCard,
    IntelligenceForce,
  },
  data() {
    return {
      collapse: true,
    };
  },
  computed: {
    ...mapGetters(['getCurrentRepository']),
    languagesList() {
      const languageObject = Object.values(
        languageListToDict(this.getCurrentRepository.available_languages),
      );
      return languageObject.join(', ');
    },
    contributorsList() {
      const { users } = this.getCurrentRepository.authorizations;
      const usersList = users.map((user) => user.nickname);
      return usersList.join(', ');
    },
  },
  methods: {
    scrollToEntity() {
      const el = document.querySelector('#entity-container');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    },
    scrollToIntent() {
      const el = document.querySelector('#intent-container');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    navigateToSentences() {
      this.$router.push({
        name: 'repository-training',
      });
    },
    onEdit(value) {
      this.$emit('edit', value);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.summary-information {
  display: flex;
  gap: $unnnic-spacing-sm;

  @media screen and (max-width: 70em) {
    flex-direction: column;
  }

  &__info {
    // margin-left: 0.5rem;
    width: 50%;

    &__title {
      color: $color-fake-black;
      font-weight: $font-weight-medium;
      font-family: $font-family;
      font-size: 1.75rem;
    }

    &__container {
      margin-top: $unnnic-spacing-md;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: $unnnic-spacing-sm;
      width: 100%;

      &__item--clickable {
        cursor: pointer;
      }

      &__training {
        display: flex;
        height: 156px;
        justify-content: space-around;
        align-items: center;
        text-align: center;
        margin-right: 10px;
        width: 50%;
        border: 1px solid $color-border;
      }

      @media screen and (max-width: 60em) {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
    }

    @media screen and (max-width: 70em) {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
    }
  }
}
</style>
