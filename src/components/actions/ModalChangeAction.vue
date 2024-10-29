<template>
  <UnnnicModalDialog
    v-model="modelValue"
    showCloseIcon
    :showActionsDivider="isCustom"
    size="md"
    :title="action.name"
    v-bind="
      isCustom
        ? {
            secondaryButtonProps: {
              text: $t('cancel'),
            },
            primaryButtonProps: {
              text: $t('save_changes'),
              disabled: !isSaveButtonActive,
              loading: isSavingAction,
              'data-test': 'save-button',
            },
          }
        : {}
    "
    class="modal-dialog"
    @secondary-button-click="close"
    @primary-button-click="saveAction"
  >
    <template v-if="isCustom">
      <UnnnicFormElement
        :label="
          $t('modals.actions.add.steps.describe.inputs.description.label')
        "
        :message="
          $t('modals.actions.add.steps.describe.inputs.description.help')
        "
        class="form-element labels-textarea"
      >
        <UnnnicTextArea
          v-model="description"
          class="text-area"
          :placeholder="
            $t(
              'modals.actions.add.steps.describe.inputs.description.placeholder',
            )
          "
          :disabled="action.editable === false"
          data-test="description-textarea"
        />
      </UnnnicFormElement>

      <UnnnicFormElement
        :label="
          $t('modals.actions.add.steps.nominate_action.inputs.name.label')
        "
        :message="
          $t('modals.actions.add.steps.nominate_action.inputs.name.help')
        "
        class="form-element"
      >
        <UnnnicInput
          v-model="name"
          :placeholder="
            $t(
              'modals.actions.add.steps.nominate_action.inputs.name.placeholder',
            )
          "
          :disabled="action.editable === false"
          data-test="name-input"
        />
      </UnnnicFormElement>
    </template>

    <template v-else>
      <section class="explanation">
        <h3 class="explanation__title">
          {{
            $t(
              'modals.actions.add.steps.select_action_type.inputs.description.label',
            )
          }}
        </h3>

        <p class="explanation__description">{{ description }}</p>
      </section>
    </template>

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
import { useAlertStore } from '@/store/Alert.js';
import { useActionsStore } from '@/store/Actions.js';
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

const alertStore = useAlertStore();
const actionsStore = useActionsStore();

const isSavingAction = ref(false);

const name = ref('');
const description = ref('');

const linkedFlow = reactive({
  status: null,
  name: '',
});

const isCustom = computed(() => props.action.group === 'custom');

const isSaveButtonActive = computed(() => {
  const { action } = props;
  if (action.actionType === 'whatsapp_cart') return name.value !== action.name;

  const fields = {
    name: name.value.trim(),
    description: description.value.trim(),
  };

  return (
    !Object.values(fields).some((value) => !value) &&
    !(
      props.action.name.trim() === fields.name &&
      props.action.description.trim() === fields.description
    )
  );
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
        } else if (flows.status.value === 'complete') {
          linkedFlow.status = 'error';
        } else {
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

    const action = await actionsStore.edit({
      uuid: actionUuid,
      name: name.value,
      prompt: description.value,
    });

    alertStore.add({
      type: 'success',
      text: i18n.global.t('modals.actions.edit.messages.success', {
        name: action.name,
      }),
    });
  } finally {
    isSavingAction.value = false;
    close();
  }
}
</script>

<style lang="scss" scoped>
.explanation {
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

.form-element + .form-element {
  margin-top: $unnnic-spacing-sm;
}

.text-area :deep(textarea:disabled) {
  outline-color: $unnnic-color-neutral-cleanest;
  background-color: $unnnic-color-neutral-lightest;
  color: $unnnic-color-neutral-cleanest;

  cursor: not-allowed;
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
</style>
