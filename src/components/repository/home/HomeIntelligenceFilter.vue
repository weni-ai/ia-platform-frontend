<template>
  <div class="intelligence-filter">
    <section class="intelligence-filter__container">
      <div class="tab-navigation__container__title">
        filtros
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

.intelligence-filter{
  width: 100%;
  height: 100%;
  border: 1px solid #E2E6ED;
  border-radius: 8px;

  &__container {
    padding: $unnnic-spacing-stack-md;

    &__title {
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-bold;
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-medium;
      color: $unnnic-color-neutral-darkest;
    }
  }
}

</style>
