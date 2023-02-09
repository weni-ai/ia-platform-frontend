<template>
  <div
    class="version-test-item">
    <router-link :to="resultRouterParams">
      <div
        class="version-test-item__wrapper">
        <div class="version-test-item__wrapper__info">
          <div class="version-test-item__wrapper__info__item">
            {{ $t('webapp.result.test') }} #{{ version }}
          </div>
<!--           <language-badge
            :language="language"
            class="version-test-item__wrapper__info__item"
            main/> -->
          <div class="version-test-item__wrapper__info__item__created">
            {{ created_at | moment('from') }}
          </div>
        </div>
        <div class="version-test-item__wrapper__progress">
          <unnnic-progress-bar
            :value="25"
            inline
            title="Acertos" />
        </div>
      </div>
    </router-link>
  </div>
</template>

<script>
import LanguageBadge from '@/components/shared/LanguageBadge';

export default {
  name: 'EvaluateVersionItem',
  components: {
    LanguageBadge,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
    version: {
      type: Number,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    created_at: {
      type: String,
      default: '',
    },
  },
  computed: {
    resultRouterParams() {
      return {
        name: 'repository-result',
        params: {
          resultId: this.id,
        },
      };
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/utilities.scss';
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';
@import '~@weni/unnnic-system/dist/unnnic.css';
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.version-test-item {
  margin: 1rem 0;
  border: 1px solid $color-grey;
  border-radius: 0.5rem;
  font-family: $font-family;

  &__wrapper {
    display: flex;
    margin: .5rem;
    align-items: center;
    cursor: pointer;

    &__info {
      flex-grow: 1;
      align-self: center;
      display: flex;
      font-family: $unnnic-font-family-secondary;
      font-weight: 700;
      font-size: 14px;
      color: $unnnic-color-neutral-dark;

      &__item {
        margin: 0 .3rem;

        &__created {
          margin-top: 0.1rem;
          margin-left: $unnnic-spacing-stack-sm;
          font-size: 12px;
          font-weight: 400;
          color: $unnnic-color-neutral-cloudy;
        }
      }
    }

    &__progress {
      margin: .5rem;

      .unnnic-progress-bar.primary {
        background-color: #fff;
        box-shadow: none;
        font-size: 12px;

/*         /deep/ .inline .title {
          font-size: 12px;
        } */

        /deep/ .progress-bar-container .progress-container {
          min-width: 100px;
          height: 4px;
        }
      }
    }
  }
}
</style>
