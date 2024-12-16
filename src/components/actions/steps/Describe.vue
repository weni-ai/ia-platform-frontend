<template>
  <section class="describe-container">
    <UnnnicFormElement
      class="labels-textarea"
      :label="$t('modals.actions.add.steps.describe.inputs.description.label')"
      :message="$t('modals.actions.add.steps.describe.inputs.description.help')"
    >
      <UnnnicTextArea
        v-model="description"
        class="text-area"
        :placeholder="
          $t('modals.actions.add.steps.describe.inputs.description.placeholder')
        "
        data-test="description-textarea"
      />
    </UnnnicFormElement>

    <SendLlmToFlow v-model="sendLlmToFlow" />
  </section>
</template>

<script setup>
import SendLlmToFlow from './SendLlmToFlow.vue';

const description = defineModel('description', {
  type: String,
  required: true,
});

const sendLlmToFlow = defineModel('sendLlmToFlow', {
  type: Boolean,
  required: true,
});

const props = defineProps({});
</script>

<style lang="scss" scoped>
.describe-container {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-md;
}
</style>
