<template>
  <UnnnicModalDialog
    v-model="modelValue"
    showCloseIcon
    showActionsDivider
    size="md"
    :title="action.name"
    :secondaryButtonProps="{
      text: $t('cancel'),
    }"
    :primaryButtonProps="{
      text: $t('save_changes'),
      disabled: !isSaveButtonActive,
      loading: isSavingAction,
      'data-test': 'save-button',
    }"
    class="modal-dialog"
    :class="{ is_text_area_disabled: isTextAreaDisabled }"
    @secondary-button-click="close"
    @primary-button-click="saveAction"
  >
    <UnnnicFormElement
      :label="$t('modals.actions.add.steps.describe.inputs.description.label')"
      :message="$t('modals.actions.add.steps.describe.inputs.description.help')"
      class="form-element labels-textarea"
    >
      <UnnnicTextArea
        v-model="description"
        class="text-area"
        :placeholder="
          isTextAreaDisabled
            ? ''
            : $t(
                'modals.actions.add.steps.describe.inputs.description.placeholder',
              )
        "
        :disabled="isTextAreaDisabled"
        data-test="description-textarea"
      />
    </UnnnicFormElement>

    <UnnnicFormElement
      :label="$t('modals.actions.add.steps.nominate_action.inputs.name.label')"
      :message="$t('modals.actions.add.steps.nominate_action.inputs.name.help')"
      class="form-element"
    >
      <UnnnicInput
        v-model="name"
        :placeholder="
          $t('modals.actions.add.steps.nominate_action.inputs.name.placeholder')
        "
        data-test="name-input"
      />
    </UnnnicFormElement>

    <section class="flow-area">
      <h3 class="flow-area__title">
        {{ $t('modals.actions.edit.assigned_flow') }}
      </h3>

      <section class="flow-area__flow">
        <UnnnicSkeletonLoading
          v-if="linkedFlow.status === 'loading'"
          tag="div"
          width="150px"
          height="22px"
        />

        <p
          v-else
          class="flow-area__flow__title"
          data-test="flow-name"
        >
          <i v-if="linkedFlow.status === 'error'">
            {{ $t('modals.actions.edit.flow_name_unavailable') }}
          </i>

          <template v-else>{{ linkedFlow.name }}</template>
        </p>

        <UnnnicButton
          type="secondary"
          size="small"
          iconLeft="account_tree"
          class="flow-area__flow__go-to-flow"
          data-test="go-to-flow-button"
          @click="openFlowEditor"
        >
          {{ $t('modals.actions.edit.go_to_flow') }}
        </UnnnicButton>
      </section>
    </section>
  </UnnnicModalDialog>
</template>

<script setup>
import { computed, onBeforeMount, reactive, ref } from 'vue';
import { useStore } from 'vuex';
import { usePagination } from '@/views/ContentBases/pagination';
import nexusaiAPI from '@/api/nexusaiAPI';
import i18n from '@/utils/plugins/i18n.js';

const modelValue = defineModel({
  type: Boolean,
});

const props = defineProps({
  action: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['edited']);

const store = useStore();

const isSavingAction = ref(false);

const name = ref('');
const description = ref('');

const linkedFlow = reactive({
  status: null,
  name: '',
});

const isSaveButtonActive = computed(() => {
  const { action } = props;
  if (action.actionType === 'whatsapp_cart') return name.value !== action.name;
  return name.value.trim() && description.value.trim();
});

const isTextAreaDisabled = computed(() => {
  return props.action.actionType === 'whatsapp_cart';
});

onBeforeMount(() => {
  const { action } = props;
  name.value = action.name;
  description.value = action.description;

  searchForFlowUuid(action.uuid);
});

function close() {
  modelValue.value = false;
}

function searchForFlowUuid(flowUuid) {
  const flows = usePagination({
    load: {
      request: nexusaiAPI.router.actions.flows.list,
      params: {
        projectUuid: store.state.Auth.connectProjectUuid,
        name: '',
      },
    },
  });

  const tryToFindLinkedFlow = () => {
    linkedFlow.status = 'loading';

    flows
      .loadNext()
      .then(() => {
        const flow = flows.data.value.find(({ uuid }) => uuid === flowUuid);

        if (flow) {
          linkedFlow.status = null;
          linkedFlow.name = flow.name;
        } else if (flows.status.value !== 'complete') {
          tryToFindLinkedFlow();
        }
      })
      .catch(() => {
        linkedFlow.status = 'error';
      });
  };

  tryToFindLinkedFlow();
}

function openFlowEditor() {
  const templateLinkFlowEditor = String(
    runtimeVariables.get('TEMPLATE_LINK_FLOW_EDITOR'),
  );

  const transformedLink = templateLinkFlowEditor
    .replace('{dashProjectUuid}', store.state.Auth.connectProjectUuid)
    .replace('{flowUuid}', props.action.uuid);

  window.open(transformedLink);
}

async function saveAction() {
  const actionUuid = props.action.uuid;

  try {
    isSavingAction.value = true;

    const { data } = await nexusaiAPI.router.actions.edit({
      projectUuid: store.state.Auth.connectProjectUuid,
      actionUuid,
      name: name.value,
      description: description.value,
    });

    const action = {
      name: data.name,
      description: data.prompt,
    };

    store.state.alert = {
      type: 'success',
      text: i18n.global.t('modals.actions.edit.messages.success', {
        name: action.name,
      }),
    };

    emit('edited', actionUuid, action);
  } finally {
    isSavingAction.value = false;
    close();
  }
}
</script>

<style lang="scss" scoped>
.form-element + .form-element {
  margin-top: $unnnic-spacing-sm;
}

.flow-area {
  margin-top: $unnnic-spacing-md;

  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-cleanest;
  padding: $unnnic-spacing-sm - $unnnic-border-width-thinner;
  border-radius: $unnnic-border-radius-sm;

  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-xs;

  &__title {
    margin: 0;
    color: $unnnic-color-neutral-dark;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-bold;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }

  &__flow {
    display: flex;
    align-items: center;
    column-gap: $unnnic-spacing-xs;
    justify-content: space-between;

    &__title {
      color: $unnnic-color-neutral-cloudy;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    }

    &__go-to-flow {
      min-width: 12.5 * $unnnic-font-size;
    }
  }
}
.modal-dialog {
  &.is_text_area_disabled {
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
