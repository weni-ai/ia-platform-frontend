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
        class="action-selector"
        @update:model-value="updateModel"
      />
    </UnnnicFormElement>

    <section class="explanation">
      <h3 class="explanation__title">
        {{
          $t(
            'modals.actions.add.steps.select_action_type.inputs.description.label',
          )
        }}
      </h3>

      <p class="explanation__description">{{ actionTypeDescription }}</p>
    </section>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  group: {
    type: String,
    required: true,
  },
});

import { useActionsStore } from '@/store/Actions.js';

const actionsStore = useActionsStore();

const name = defineModel('name', {
  type: String,
  required: true,
});

const description = defineModel('description', {
  type: String,
  required: true,
});

const actionType = defineModel('actionType', {
  type: String,
  required: true,
});

const type = ref(null);

const types = computed(() => {
  return actionsStore.typesAvailable
    .filter(({ group }) => group === props.group)
    .map(({ name, prompt, type }) => ({
      label: name,
      value: prompt,
      description: prompt,
      type,
    }));
});

const currentActionType = computed(() =>
  types.value.find(({ value }) => value === type.value),
);

const actionTypeModelValue = computed(() =>
  currentActionType.value ? [currentActionType.value] : [],
);

const actionTypeDescription = computed(
  () => currentActionType.value?.description || '',
);

function updateModel($event) {
  const { label, value, type: optionType } = $event[0];

  type.value = value;

  name.value = label;
  description.value = value;
  actionType.value = optionType;
}
</script>

<style lang="scss" scoped>
.action-selector {
  :deep(.unnnic-select-smart-option__description) {
    white-space: normal;
  }
}

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
