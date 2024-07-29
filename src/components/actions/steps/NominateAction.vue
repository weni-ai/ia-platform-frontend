<template>
  <UnnnicIntelligenceText
    tag="p"
    color="neutral-cloudy"
    family="secondary"
    size="body-gt"
    marginBottom="sm"
  >
    {{ $t('modals.actions.add.steps.nominate_action.explanation') }}
  </UnnnicIntelligenceText>

  <UnnnicFormElement
    :label="$t('modals.actions.add.steps.nominate_action.inputs.name.label')"
    :message="$t('modals.actions.add.steps.nominate_action.inputs.name.help')"
  >
    <UnnnicInput
      v-model="name"
      :placeholder="
        $t('modals.actions.add.steps.nominate_action.inputs.name.placeholder')
      "
    />
  </UnnnicFormElement>
</template>

<script setup>
const name = defineModel('name', {
  type: String,
  required: true,
});
</script>
