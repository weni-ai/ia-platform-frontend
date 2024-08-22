<template>
  <section
    class="describe-container"
    :class="{ 'whatsapp-cart-active': actionType === 'whatsapp_cart' }"
  >
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
        :disabled="actionType === 'whatsapp_cart'"
      />
    </UnnnicFormElement>

    <UnnnicFormElement
      :label="$t('modals.actions.add.steps.describe.inputs.radio.label')"
    >
      <UnnnicRadio
        v-for="option in flowOptions"
        :key="option.value"
        v-model="actionType"
        :value="option.value"
        size="md"
        data-test="radio-option"
        :disabled="hasCartAction() && option.value === 'whatsapp_cart'"
      >
        <UnnnicToolTip
          side="top"
          :text="
            $t('modals.actions.add.steps.describe.inputs.radio.disable_message')
          "
          :enabled="hasCartAction() && option.value === 'whatsapp_cart'"
          data-test="radio-tooltip"
        >
          {{ option.text }}
        </UnnnicToolTip>
      </UnnnicRadio>
    </UnnnicFormElement>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue';
import i18n from '@/utils/plugins/i18n.js';

const description = defineModel('description', {
  type: String,
  required: true,
});

const actionType = defineModel('actionType', {
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

const hasCartAction = () => {
  return props.currentActions.some(
    (action) => action.actionType === 'whatsapp_cart',
  );
};

const flowOptions = ref([
  {
    value: 'custom',
    text: i18n.global.t(
      'modals.actions.add.steps.describe.inputs.radio.options.normal',
    ),
  },
  {
    value: 'whatsapp_cart',
    text: i18n.global.t(
      'modals.actions.add.steps.describe.inputs.radio.options.cart',
    ),
  },
]);

watch(actionType, (newVal) => {
  if (newVal === 'whatsapp_cart') {
    description.value = i18n.global.t(
      'modals.actions.add.steps.describe.inputs.description.aux_text_whatsapp_cart',
    );
  }

  if (newVal === 'custom') description.value = '';
});
</script>

<style lang="scss" scoped>
.describe-container {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-md;

  &.whatsapp-cart-active {
    .labels-textarea {
      :deep(.label),
      :deep(.message) {
        color: $unnnic-color-neutral-cleanest;
      }
    }

    :deep(.unnnic-text-area textarea) {
      color: $unnnic-color-neutral-cleanest;
      background-color: $unnnic-color-neutral-lightest;
    }
  }
}
</style>
