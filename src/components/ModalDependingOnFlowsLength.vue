<template>
  <div>
    <unnnic-modal-next
      class="integrate"
      v-if="showHowToIntegrate"
      @close="showHowToIntegrate = false"
      show-close-button
    >
    <div class="integrate--title">
      {{ $t('modals.how_to_integrate.title') }}
    </div>

    <div class="integrate__content">
      <img class="integrate__gif" :src="currentImage" alt="" />

      <span
        v-if="step === 1"
        class="integrate__description"
        v-html="$t('modals.how_to_integrate.first_step.description')"
      />
      <span
        v-else
        class="integrate__description"
        v-html="$t('modals.how_to_integrate.second_step.description')"
      />
    </div>

    <div class="integrate__buttons">
      <unnnic-button
        v-if="step === 2"
        type="tertiary"
        @click.stop="step = 1"
        :text="$t('modals.how_to_integrate.second_step.back_button')"
      />
      <unnnic-button
        type="secondary"
        @click="nextStep"
        :text="
          step === 2 ? $t('modals.how_to_integrate.second_step.close_button')
          :
          $t('modals.how_to_integrate.first_step.next_step')
        "
      />
    </div>
  </unnnic-modal-next>
  </div>
</template>

<script>
import iframessa from 'iframessa';
import IntelligenceFirstGif from '@/assets/gifs/ia-1.gif';
import IntelligenceSecondGif from '@/assets/gifs/ia-2.gif';

export default {
  data() {
    return {
      showHowToIntegrate: false,
      hasFlows: null,
      step: 1
    };
  },

  created() {
    iframessa.get('hasFlows', ({ data: hasFlows }) => {
      this.hasFlows = hasFlows;
    });

    iframessa.on('update:hasFlows', ({ data: hasFlows }) => {
      this.hasFlows = hasFlows;
    });
  },

  computed: {
    projectUuidAndHasFlows() {
      return [
        this.$store.state.Auth.project,
      ].join(':');
    },
    currentImage() {
      if (this.step === 2) return IntelligenceSecondGif;

      return IntelligenceFirstGif;
    },
  },

  watch: {
    projectUuidAndHasFlows: {
      immediate: true,

      handler() {
        let data = {};

        try {
          data = JSON.parse(
            sessionStorage.getItem('tutorials:howToIntegrateAI') || '[]',
          );

          const projectUuid = this.$store.state.Auth.project;

          if (!data.includes(projectUuid)) {
            // this.showHowToIntegrate = true;

            data.push(projectUuid);

            sessionStorage.setItem(
              'tutorials:howToIntegrateAI',
              JSON.stringify(data),
            );
          }
        } catch (error) {
          console.log(error);
        }
      },
    },
  },

  methods: {
    redirectToFlows() {
      iframessa.emit('redirectToFlows', { path: 'init' });
    },
    nextStep() {
      if (this.step === 1) this.step = 2;
      else this.showHowToIntegrate = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.unnnic-modal ::v-deep > .container > .content {
  box-sizing: initial;
}

.modal--title {
  text-align: center;
  margin-bottom: $unnnic-spacing-stack-sm;
}

.integrate {
  font-family: $unnnic-font-family-secondary;

  ::v-deep {
    .container {
      padding: $unnnic-squish-md !important;
    }

    .header {
      margin-bottom: $unnnic-spacing-stack-nano !important;
    }

    .content {
      display: flex;
      flex-direction: column;
      overflow: auto !important;
    }
  }

  &--title {
    text-align: center;
    margin-bottom: $unnnic-spacing-stack-xs;
    font-weight: $unnnic-font-weight-black;
    font-size: $unnnic-font-size-title-sm;
    line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
    color: $unnnic-color-neutral-darkest;
  }

  &__content {
    display: flex;
    flex-direction: column;
    overflow: auto;

    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    color: $unnnic-color-neutral-cloudy;
  }

  &__gif {
    height: 167px;
    width: 368px;
    margin: 0 auto;
  }

  &__description {
    padding-right: .5rem;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    color: $unnnic-color-neutral-cloudy;
    text-align: left;
    margin-top: $unnnic-spacing-stack-sm;

    flex: 1;
    overflow: overlay;
  }

  &__buttons {
    margin-top: $unnnic-spacing-stack-sm;
    display: flex;
    gap: $unnnic-spacing-inline-lg;

    .unnnic-button {
      width: 100%;
    }

    .container {
      max-height: 95vh !important;
    }
    .actions {
      margin-top: 2.5rem !important;
    }
  }
}
</style>
