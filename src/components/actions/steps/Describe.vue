<template>
  <UnnnicFormElement
    :label="$t('modals.actions.add.steps.describe.inputs.description.label')"
    :message="$t('modals.actions.add.steps.describe.inputs.description.help')"
  >
    <UnnnicTextArea
      v-model="description"
      :placeholder="
        $t('modals.actions.add.steps.describe.inputs.description.placeholder')
      "
      data-test="description-textarea"
    />
  </UnnnicFormElement>
</template>

<script setup>
const description = defineModel('description', {
  type: String,
  required: true,
});
</script>
