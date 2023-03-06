<template>
  <div class="intelligence-filter">
    <section class="intelligence-filter__container">
      <div class="intelligence-filter__container__title">
        <h2>{{ $t("webapp.home.intelligence_filter_title") }}</h2>
      </div>
      <div class="intelligence-filter__container__recommended">
        <div class="intelligence-filter__container__item">
          <unnnic-checkbox
            size="md"
            v-model="recommended"
          />
          <p>Recomendadas</p>
        </div>

        <div class="intelligence-filter__container__item">
          <unnnic-checkbox
            size="md"
            v-model="mostUsed"
          />
          <p>Mais usadas</p>
        </div>
      </div>
      <div class="intelligence-filter__container__categories">
        <h3>{{ $t("webapp.home.intelligence_filter_category") }}</h3>
        <div class="intelligence-filter__container__categories__items">
            <div
              v-for="(category, index) in categories"
              :key="index"
              class="intelligence-filter__container__item"
              >
              <unnnic-checkbox
                v-model="category.value"
                size="md"
              />
              <p v-html="category.label" />
            </div>
        </div>
      </div>
      <div class="intelligence-filter__container__languages">
        <h3>Idioma</h3>
        <unnnic-select
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
          </unnnic-select>
      </div>
    </section>
  </div>
</template>

<script>
import { formatters, LANGUAGES } from '@/utils';

export default {
  name: 'HomeIntelligenceFilter',
  data(){
    return {
      recommended: true,
      mostUsed: false,
      categories: [
        { label: 'Social', value: false },
        { label: 'Service', value: false },
        { label: 'Configuration', value: false },
        { label: 'Finances', value: false },
        { label: 'Business', value: false },
        { label: 'Commercial', value: false },
        { label: 'Education', value: false },
        { label: 'Food', value: false },
        { label: 'Health', value: false },
        { label: 'Technology', value: false },
        { label: 'Other', value: false },
      ],
      language: null
    }
  },
  watch: {
    filter() {
      console.log(this.filter)
      this.$emit('change', this.filter)
    }
  },
  computed: {
    filter() {
      return {
        categories: this.categories
          .filter(category => category.value === true)
          .map(item => item.label),
        most_used: this.mostUsed ? 'True' : '',
        recommended: this.recommended ? 'True' : '',
        language: this.language
      }
    },
    languageList() {
      return Object.keys(LANGUAGES)
        .map(lang => ([lang, LANGUAGES[lang]]));
    },
  },
  methods: {
    // onChangeCategory() {
    //   const checked = this.categories.filter(category => category.value === true)
    //   this.$emit('change', this.query)
    // }
  }
}
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/dist/unnnic.css';
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.intelligence-filter {
  width: 100%;
  height: max-content;
  border: 1px solid #E2E6ED;
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

    &__recommended, &__categories, &__languages {
      margin-top: $unnnic-spacing-stack-sm;
    }

    &__item {
      display: flex;
      align-items: center;
      margin-top: $unnnic-spacing-stack-xs;

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

        /deep/ .input {
          height: 36px;
        }
        /deep/ .dropdown {
          display: block;
        }
      }
    }
  }
}

</style>
