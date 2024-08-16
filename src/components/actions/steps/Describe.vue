<template>
  <section class="describe-container">
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
      >
        {{ option.text }}
      </UnnnicRadio>
    </UnnnicFormElement>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import i18n from '@/utils/plugins/i18n.js';

const description = defineModel('description', {
  type: String,
  required: true,
});

const actionType = defineModel('actionType', {
  type: String,
  required: true,
});

const flowOptions = ref([
  {
    value: 'normal',
    text: i18n.global.t(
      'modals.actions.add.steps.describe.inputs.radio.options.normal',
    ),
  },
  {
    value: 'cart',
    text: i18n.global.t(
      'modals.actions.add.steps.describe.inputs.radio.options.cart',
    ),
  },
]);
</script>

<style lang="scss" scoped>
.describe-container {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-md;
}
</style>
