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
          :key="brainOn"
          :textRight="$t('router.tunings.advanced.brain')"
          :value="brainOn"
          class="custom-switch"
          @input="openActiveOrDeactivateBrain"
        />
      </UnnnicFormElement>
    </section>
  </section>
</template>

<script>
import nexusaiAPI from '../../../../api/nexusaiAPI';

export default {
  props: {
    brainOn: Boolean,
  },

  components: {},

  data() {
    return {
      open: false,

      brain: true,

      isActiveBrainOpen: false,
    };
  },

  mounted() {},

  watch: {
    open() {
      if (this.open) {
        this.$el.scrollIntoView({ behavior: 'smooth' });
      }
    },

    '$route.query.activate_brain': {
      immediate: true,

      handler(active) {
        if (active) {
          this.$router.push({ query: {} });

          this.open = true;
          this.openActiveOrDeactivateBrain(true);

          this.$nextTick(() => {
            this.$el.scrollIntoView({ behavior: 'smooth' });
          });
        }
      },
    },
  },

  methods: {
    openActiveOrDeactivateBrain($event) {
      this.$emit('update:brainOn', $event);

      this.$nextTick(() => {
        this.$emit('update:brainOn', !$event);
      });

      if ($event) {
        this.$store.state.modalWarn = {
          title: this.$t('router.tunings.advanced.active_brain_modal.title'),
          description: this.$t(
            'router.tunings.advanced.active_brain_modal.description',
          ),
          closeText: this.$t(
            'router.tunings.advanced.active_brain_modal.cancel',
          ),
          actionText: this.$t(
            'router.tunings.advanced.active_brain_modal.action',
          ),
          loading: false,
          action: this.changeBrainOn.bind(this, true),
        };
      } else {
        this.$store.state.modalWarn = {
          title: this.$t(
            'router.tunings.advanced.deactivate_brain_modal.title',
          ),
          description: this.$t(
            'router.tunings.advanced.deactivate_brain_modal.description',
          ),
          closeText: this.$t(
            'router.tunings.advanced.deactivate_brain_modal.cancel',
          ),
          actionText: this.$t(
            'router.tunings.advanced.deactivate_brain_modal.action',
          ),
          loading: false,
          action: this.changeBrainOn.bind(this, false),
        };
      }

      this.$nextTick(() => {
        const actionButton = document.querySelector(
          'button.unnnic-button--attention',
        );

        if (actionButton) {
          actionButton.focus();
        }
      });
    },

    async changeBrainOn(brain_on) {
      try {
        this.$store.state.modalWarn.loading = true;

        const { data } = await nexusaiAPI.router.tunings.advanced.edit({
          projectUuid: this.$store.state.Auth.connectProjectUuid,
          brain_on,
        });

        this.$emit('update:brainOn', data.brain_on);
      } finally {
        this.$store.state.modalWarn = null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.custom-switch ::v-deep {
  span {
    cursor: pointer;
  }
}

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
