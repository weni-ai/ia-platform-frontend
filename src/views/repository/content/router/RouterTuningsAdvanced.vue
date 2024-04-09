<template>
  <section class="advanced">
    <header
      class="advanced__header"
      @click="open = !open"
    >
      <UnnnicIntelligenceText
        color="neutral-dark"
        family="secondary"
        weight="bold"
        size="body-gt"
      >
        {{ $t('router.tunings.advanced.title') }}
      </UnnnicIntelligenceText>

      <UnnnicIcon
        scheme="neutral-dark"
        :icon="open ? 'expand_less' : 'expand_more'"
        size="ant"
        clickable
      />
    </header>

    <section
      v-show="open"
      class="advanced__content"
    >
      <UnnnicIntelligenceText
        color="neutral-cloudy"
        family="secondary"
        size="body-gt"
        tag="p"
      >
        {{ $t('router.tunings.advanced.description') }}
      </UnnnicIntelligenceText>

      <UnnnicFormElement class="advanced__content__brain-switch">
        <UnnnicSwitch
          :textRight="$t('router.tunings.advanced.brain')"
          :value="brain"
          @input="brain = $event"
        />
      </UnnnicFormElement>
    </section>
  </section>
</template>

<script>
export default {
  data() {
    return {
      open: false,

      brain: true,
    };
  },

  watch: {
    open() {
      if (this.open) {
        this.$el.scrollIntoView({ behavior: 'smooth' });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.advanced {
  padding: $unnnic-spacing-sm;

  outline-style: solid;
  outline-color: $unnnic-color-neutral-cleanest;
  outline-width: $unnnic-border-width-thinner;
  outline-offset: -$unnnic-border-width-thinner;
  border-radius: $unnnic-border-radius-md;

  &__header {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    column-gap: $unnnic-spacing-nano;
  }

  &__content {
    margin-top: $unnnic-spacing-sm;

    &__brain-switch {
      margin-top: $unnnic-spacing-xs;
    }
  }
}
</style>
