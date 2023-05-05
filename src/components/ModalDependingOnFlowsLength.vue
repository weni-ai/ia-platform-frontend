<template>
  <div>
    <unnnic-modal-next
      v-if="hasFlows === false"
      type="alert"
      :title="$t('modals.cant_access.title')"
      icon="app-window-edit-1"
      scheme="brand-weni-soft"
      :action-primary-label="
        $t('modals.cant_access.button_primary_label')
      "
      action-primary-button-type="secondary"
      @click-action-primary="redirectToFlows"
    >
      <span
        slot="description"
        v-html="$t('modals.cant_access.description')"
      ></span>
    </unnnic-modal-next>

    <unnnic-modal-next
      v-if="showHowToIntegrate && step === 1"
      type="alert"
      class="integrate-modal"
      :title="$t('modals.how_to_integrate.title')"
      scheme="brand-weni-soft"
      show-close-button
      @close="showHowToIntegrate = false"
      :action-primary-label="
        $t('modals.how_to_integrate.first_step.next_step')
      "
      action-primary-button-type="secondary"
      @click-action-primary="step = 2"
    >
    <div class="integrate-modal__wrapper" slot="description">
      <img :src="require(`../assets/gifs/ia-1.gif`)" class="integrate-modal__image">
    </div>
      <span
        slot="description"
        v-html="$t('modals.how_to_integrate.first_step.description')"
      ></span>
    </unnnic-modal-next>
    <unnnic-modal-next
      v-if="showHowToIntegrate && step === 2"
      type="alert"
      class="integrate-modal"
      :title="$t('modals.how_to_integrate.title')"
      scheme="brand-weni-soft"
      show-close-button
      @close="showHowToIntegrate = false"
      :action-primary-label="$t('modals.how_to_integrate.second_step.close_button')"
      action-primary-button-type="secondary"
      @click-action-primary="showHowToIntegrate = false"
      :action-secondary-label="
        $t('modals.how_to_integrate.second_step.back_button')
      "
      @click-action-secondary="step = 1"
    >
    <div class="integrate-modal__wrapper" slot="description">
      <img :src="require(`../assets/gifs/ia-2.gif`)" class="integrate-modal__image">
    </div>
      <span
        slot="description"
        v-html="$t('modals.how_to_integrate.second_step.description')"
      ></span>
    </unnnic-modal-next>
  </div>
</template>

<script>
import iframessa from 'iframessa';

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
        this.hasFlows,
      ].join(':');
    },
  },

  watch: {
    projectUuidAndHasFlows: {
      immediate: true,

      handler() {
        if (this.hasFlows === null) {
          return;
        }

        let data = {};

        try {
          data = JSON.parse(
            sessionStorage.getItem('tutorials:howToIntegrateAI') || '[]',
          );

          const projectUuid = this.$store.state.Auth.project;

          if (this.hasFlows && !data.includes(projectUuid)) {
            this.showHowToIntegrate = true;

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
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .icon {
    display: block;
    height: initial;
    width: initial;
  }

  .title {
    margin-bottom: 0 !important;
  }
  .integrate-modal {
    .icon {
      display: none;
    }

    &__image {
      width: 80%;
    }

    &__wrapper {
      margin-bottom: 1.5rem;
    }
  }
}
</style>
