<template>
  <div class="version-test-item">
    <RouterLink :to="resultRouterParams">
      <div class="version-test-item__wrapper">
        <div class="version-test-item__wrapper__info">
          <strong class="version-test-item__wrapper__info__item">
            {{ $t('webapp.result.test') }} #{{ version }}
          </strong>
          <LanguageBadge
            :language="language"
            class="version-test-item__wrapper__info__item"
            main
          />
          <small class="version-test-item__wrapper__info__item">
            {{ created_at | moment('from') }}</small
          >
        </div>
        <div class="version-test-item__wrapper__links">
          <RouterLink :to="resultRouterParams">
            <a> {{ $t('webapp.result.load_result') }} </a>
          </RouterLink>
        </div>
      </div>
    </RouterLink>
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

.version-test-item {
  margin: 1rem 0;
  border: 1px solid $color-grey;
  border-radius: 0.5rem;
  font-family: $font-family;

  &__wrapper {
    display: flex;
    margin: 0.5rem;
    align-items: center;
    cursor: pointer;

    &__info {
      flex-grow: 1;
      align-self: center;

      &__item {
        margin: 0 0.3rem;
      }
    }

    &__links {
      margin: 0.5rem;
    }
  }
}
</style>
