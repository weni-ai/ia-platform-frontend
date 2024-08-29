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
  </section>
</template>

<script setup>
const description = defineModel('description', {
  type: String,
  required: true,
});

const props = defineProps({
  currentActions: {
    type: Array,
    default() {
      return [];
    },
    required: false,
  },
});
</script>

<style lang="scss" scoped>
.describe-container {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-md;
}
</style>
