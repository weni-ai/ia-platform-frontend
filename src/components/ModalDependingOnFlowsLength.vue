<template>
  <div>
    <unnnic-modal-next
      v-if="flowCount === 0"
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
      v-if="showHowToIntegrate"
      type="alert"
      :title="$t('modals.how_to_integrate.title')"
      icon="science-fiction-robot-2"
      scheme="brand-weni-soft"
      show-close-button
      @close="showHowToIntegrate = false"
    >
      <span
        slot="description"
        v-html="$t('modals.how_to_integrate.description')"
      ></span>
    </unnnic-modal-next>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showHowToIntegrate: false,
      flowCount: null,
    };
  },

  created() {
    window.parent.postMessage({ event: 'ia:get-flows-length' }, '*');

    window.addEventListener('message', event => {
      if (event.data?.event === 'connect:set-flows-length') {
        this.flowCount = event.data.flowsLength;
      }
    });
  },

  computed: {
    projectUuidAndFlowCount() {
      return [
        this.$store.state.Auth.project,
        this.flowCount,
      ].join(':');
    },
  },

  watch: {
    projectUuidAndFlowCount: {
      immediate: true,

      handler() {
        if (this.flowCount === null) {
          return;
        }

        let data = {};

        try {
          data = JSON.parse(
            sessionStorage.getItem('tutorials:howToIntegrateAI') || '[]',
          );

          const projectUuid = this.$store.state.Auth.project;

          if (this.flowCount >= 1 && !data.includes(projectUuid)) {
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
      window.parent.postMessage(
        {
          event: 'flows:redirect',
          path: 'init',
        },
        '*',
      );
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
}
</style>
