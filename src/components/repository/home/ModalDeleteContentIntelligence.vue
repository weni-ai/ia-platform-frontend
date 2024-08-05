<template>
  <UnnnicModal
    showModal
    :text="$t('intelligences.delete_intelligence')"
    scheme="aux-red-500"
    modalIcon="error"
    data-test="modal"
    @close="$emit('close')"
  >
    <template #message>
      <span
        v-html="
          $t(
            'intelligences.delete_intelligence_confirmation_modal_description',
            {
              name,
            },
          )
        "
      ></span>
    </template>
    <template #options>
      <UnnnicButton
        type="tertiary"
        data-test="cancel-button"
        @click="$emit('close')"
      >
        {{ $t('cancel') }}
      </UnnnicButton>
      <UnnnicButton
        type="warning"
        data-test="action-button"
        :loading="deletingIntelligence"
        @click="deleteIntelligence"
      >
        {{ $t('delete') }}
      </UnnnicButton>
    </template>
  </UnnnicModal>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import nexusaiAPI from '@/api/nexusaiAPI';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },

  uuid: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['removed', 'close']);

const store = useStore();
const deletingIntelligence = ref(false);

function deleteIntelligence() {
  deletingIntelligence.value = true;

  nexusaiAPI
    .deleteIntelligence({
      orgUuid: store.state.Auth.connectOrgUuid,
      intelligenceUuid: props.uuid,
    })
    .then(() => {
      emit('removed');
      emit('close');
    })
    .finally(() => {
      deletingIntelligence.value = false;
    });
}
</script>
