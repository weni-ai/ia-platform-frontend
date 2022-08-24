<template>
  <unnnic-modal
      :showModal="open"
      :text="$t('webapp.trainings.train_response_title')"
      scheme="feedback-green"
      modal-icon="check-circle-1-1"
      @close="open = false"
    >
      <span
      slot="message"
      v-html="$t('webapp.trainings.train_response_subtitle')" />
    </unnnic-modal>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'TrainResponse',
  props: {
    open: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    ...mapActions([
      'setRepositoryTraining',
    ]),
    closeModal() {
      this.setRepositoryTraining(false);
      this.$emit('dispatchCloseProgress');
      this.$emit('resetProgressValue');
    },
  },
};
</script>

