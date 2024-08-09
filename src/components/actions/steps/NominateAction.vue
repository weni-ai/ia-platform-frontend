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
    <UnnnicSkeletonLoading
      v-if="props.loading"
      class="skeleton-loading__label"
      tag="div"
      width="502px"
      height="46px"
    />
    <UnnnicInput
      v-else
      v-model="name"
      :placeholder="
        $t('modals.actions.add.steps.nominate_action.inputs.name.placeholder')
      "
      data-test="nominate-action-input"
    />
  </UnnnicFormElement>
</template>

<script setup>
const name = defineModel('name', {
  type: String,
  required: true,
});
const props = defineProps({
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>
