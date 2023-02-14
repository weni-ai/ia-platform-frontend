<template>
  <div class="intelligence-filter">
    <section class="intelligence-filter__container">
      <div class="intelligence-filter__container__title">
        <h2>{{ $t("webapp.home.intelligence_filter_title") }}</h2>
      </div>
      <div class="intelligence-filter__container__recommended">
        <div class="intelligence-filter__container__item">
          <unnnic-checkbox
            size="xs"
            value
          />
          <p>Recomendadas</p>
        </div>

        <div class="intelligence-filter__container__item">
          <unnnic-checkbox
            size="xs"
          />
          <p>Mais usadas</p>
        </div>
      </div>
      <div class="intelligence-filter__container__categories">
        <h3>{{ $t("webapp.home.intelligence_filter_category") }}</h3>
        <div class="intelligence-filter__container__categories__items">
          <div>
            <div class="intelligence-filter__container__item">
              <unnnic-checkbox
                size="xs"
                value
              />
              <p>Social</p>
            </div>
            <div class="intelligence-filter__container__item">
              <unnnic-checkbox
                size="xs"
                value
              />
              <p>Service</p>
            </div>
            <div class="intelligence-filter__container__item">
              <unnnic-checkbox
                size="xs"
                value
              />
              <p>Configuration</p>
            </div>
            <div class="intelligence-filter__container__item">
              <unnnic-checkbox
                size="xs"
                value
              />
              <p>Finances</p>
            </div>
            <div class="intelligence-filter__container__item">
              <unnnic-checkbox
                size="xs"
                value
              />
              <p>Business</p>
            </div>
            <div class="intelligence-filter__container__item">
              <unnnic-checkbox
                size="xs"
                value
              />
              <p>Comercial</p>
            </div>
          </div>
          <div>
            <div class="intelligence-filter__container__item">
              <unnnic-checkbox
                size="xs"
                value
              />
              <p>Comercial</p>
            </div>
          </div>
        </div>
      </div>
      <div class="intelligence-filter__container__languages">
        <h3>{{ $t("webapp.home.intelligence_filter_languages") }}</h3>
        <unnnic-select
          :placeholder="$t('webapp.home.intelligence_filter_languages_select')"
          size="sm"
        />
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomeIntelligenceFilter',
  data(){
    return {
    }
  },
}
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/dist/unnnic.css';
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.intelligence-filter {
  width: 100%;
  height: 100%;
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
        display: flex;
      }
    }
    &__languages {
      .unnnic-select {
        margin-top: $unnnic-spacing-stack-xs;

        /deep/ .input {
          height: 36px;
        }
      }
    }
  }
}

</style>
