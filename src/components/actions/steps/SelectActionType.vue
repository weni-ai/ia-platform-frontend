<template>
  <section>
    <UnnnicFormElement
      class="labels-textarea"
      :label="
        $t(
          'modals.actions.add.steps.select_action_type.inputs.select_action_type.label',
        )
      "
    >
      <UnnnicSelectSmart
        :modelValue="actionTypeModelValue"
        :options="types"
        @update:model-value="updateModel"
      />
    </UnnnicFormElement>

    <section class="explanation">
      <h3 class="explanation__title">
        {{ $t('modals.actions.add.steps.describe.inputs.description.label') }}
      </h3>

      <p class="explanation__description">{{ actionTypeDescription }}</p>
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const name = defineModel('name', {
  type: String,
  required: true,
});

const actionType = defineModel('actionType', {
  type: String,
  required: true,
});

const types = computed(() => {
  return [
    {
      value: '6',
      label: 'Option 2',
      description: 'This is the first option',
    },
    {
      value: '5',
      label: 'Option 3',
      description: 'This is the second option',
    },
  ];
});

const currentActionType = computed(() =>
  types.value.find(({ value }) => value === actionType.value),
);

const actionTypeModelValue = computed(() =>
  currentActionType.value ? [currentActionType.value] : [],
);

const actionTypeDescription = computed(
  () => currentActionType.value?.description || '',
);

function updateModel($event) {
  const { label, value } = $event[0];

  name.value = label;
  actionType.value = value;
}
</script>

<style lang="scss" scoped>
.explanation {
  margin-top: $unnnic-spacing-md;

  h3,
  p {
    margin: 0;
  }

  h3 {
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;

    margin-bottom: $unnnic-spacing-nano;
  }

  p {
    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }
}
</style>
