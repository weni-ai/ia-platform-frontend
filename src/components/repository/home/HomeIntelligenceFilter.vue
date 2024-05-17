<template>
  <div class="intelligence-filter">
    <section class="intelligence-filter__container">
      <div class="intelligence-filter__container__title">
        <h2>{{ $t('webapp.home.intelligence_filter.title') }}</h2>
      </div>
      <div class="intelligence-filter__container__recommended">
        <div class="intelligence-filter__container__item">
          <UnnnicCheckbox
            size="md"
            v-model="recommended"
          />
          <p>{{ $t('webapp.home.intelligence_filter.recommended') }}</p>
        </div>

        <div class="intelligence-filter__container__item">
          <UnnnicCheckbox
            size="md"
            v-model="mostUsed"
          />
          <p>{{ $t('webapp.home.intelligence_filter.most_used') }}</p>
        </div>
      </div>
      <div class="intelligence-filter__container__categories">
        <h3>{{ $t('webapp.home.intelligence_filter.category') }}</h3>
        <div class="intelligence-filter__container__categories__items">
          <div
            v-for="(category, index) in categories"
            :key="index"
            class="intelligence-filter__container__item"
          >
            <UnnnicCheckbox
              v-model="category.value"
              size="md"
            />
            <p v-html="category.name" />
          </div>
        </div>
      </div>
      <div class="intelligence-filter__container__languages">
        <h3>{{ $t('webapp.home.intelligence_filter.languages') }}</h3>
        <UnnnicSelect
          :placeholder="$t('webapp.translate.languages_select')"
          v-model="language"
          size="sm"
        >
          <option
            v-for="[option, label] in languageList"
            :key="option"
            :value="option"
            @select="language = option"
          >
            {{ label }}
          </option>
        </UnnnicSelect>
      </div>
    </section>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { LANGUAGES } from '@/utils';

export default {
  name: 'HomeIntelligenceFilter',
  data() {
    return {
      recommended: false,
      mostUsed: false,
      categories: [],
      language: null,
    };
  },
  watch: {
    filter() {
      this.$emit('change', this.filter);
    },
  },
  computed: {
    filter() {
      const params = {
        categories: this.categories
          .filter((category) => category.value === true)
          .map((item) => item.name)
          .join(),
        most_used: this.mostUsed ? 'True' : '',
        recommended: this.recommended ? 'True' : '',
        language: this.language,
      };
      // eslint-disable-next-line no-return-assign
      return Object.entries(params).reduce(
        (a, [k, v]) => (v ? ((a[k] = v), a) : a),
        {},
      );
    },
    languageList() {
      return Object.keys(LANGUAGES).map((lang) => [lang, LANGUAGES[lang]]);
    },
  },
  mounted() {
    this.getCategories();
  },
  methods: {
    ...mapActions(['getAllCategories']),
    async getCategories() {
      try {
        const { data } = await this.getAllCategories();
        const sortedData = data.sort((previous, next) => previous.id - next.id);
        this.categories = sortedData.map((category) => ({
          value: false,
          ...category,
        }));
      } catch (error) {
        this.$buefy.toast.open({
          message: error,
          type: 'is-danger',
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/dist/unnnic.css';
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.intelligence-filter {
  width: 100%;
  height: max-content;
  border: 1px solid #e2e6ed;
  border-radius: 8px;

  &__container {
    padding: $unnnic-spacing-stack-md;

    h3 {
      font-family: $unnnic-font-family-secondary;
      color: $unnnic-color-neutral-cloudy;
      font-size: 14px;
      font-weight: $unnnic-font-weight-bold;
    }

    p {
      font-family: $unnnic-font-family-secondary;
      color: $unnnic-color-neutral-cloudy;
      font-size: 14px;
    }

    &__title h2 {
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-bold;
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-medium;
      color: $unnnic-color-neutral-darkest;
    }

    &__recommended,
    &__categories,
    &__languages {
      margin-top: $unnnic-spacing-stack-sm;
    }

    &__item {
      display: flex;
      align-items: center;
      margin-top: $unnnic-spacing-stack-sm;

      p {
        margin-left: 4px;
      }
    }

    &__categories {
      height: 100%;

      &__items {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
    }
    &__languages {
      .unnnic-select {
        margin-top: $unnnic-spacing-stack-xs;

        :deep(.input) {
          height: 36px;
        }
        :deep(.dropdown) {
          display: block;
        }
      }
    }
  }
}
</style>
