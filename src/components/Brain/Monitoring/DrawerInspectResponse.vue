<template>
  <UnnnicDrawer
    :modelValue="modelValue"
    :title="$t('router.monitoring.inspect_response.title')"
    :description="
      $t(
        'router.monitoring.inspect_response.intelligent_agent_response_details',
      )
    "
    @close="close"
  >
    <template #content>
      <section>
        <UnnnicIntelligenceText
          color="neutral-cloudy"
          family="secondary"
          size="body-gt"
          tag="p"
        >
          Mensagem do contato:
        </UnnnicIntelligenceText>
        <p>“{{ inspectionData.text }}”</p>
      </section>
      <section>
        <UnnnicIntelligenceText
          color="neutral-cloudy"
          family="secondary"
          size="body-gt"
          tag="p"
        >
          Resposta do agente:
        </UnnnicIntelligenceText>
        <p v-if="inspectionData.llm.status !== 'success'">
          “{{ inspectionData.llm.response }}”
        </p>
        <section v-else>
          <template
            v-for="item of inspectionData.groundedness"
            :key="item.sentence"
          >
            <p>{{ item.sentence }}</p>
          </template>
        </section>
      </section>
    </template>
  </UnnnicDrawer>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },

  inspectionData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:model-value']);

function close() {
  emit('update:model-value', false);
}
</script>

<style lang="scss" scoped></style>
