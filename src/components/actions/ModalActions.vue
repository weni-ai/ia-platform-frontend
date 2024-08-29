<template>
  <UnnnicModalDialog
    showCloseIcon
    showActionsDivider
    :title="currentStep.title"
    size="lg"
    :hideSecondaryButton="currentStep === firstStep"
    :secondaryButtonProps="{
      text: $t('back'),
      'data-test': 'previous-button',
    }"
    :primaryButtonProps="{
      text: currentStep === lastStep ? $t('finish') : $t('next'),
      disabled: !isPrimaryButtonActive,
      loading: isAdding,
      'data-test': 'next-button',
    }"
    @secondary-button-click="goToPreviousStep"
    @primary-button-click="goToNextStep"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #leftSidebar>
      <LeftSidebar
        v-bind="
          isCustom
            ? {
                title: $t('modals.actions.add.title'),
                description: $t('modals.actions.add.description'),
              }
            : {
                title: $t('modals.actions.add.custom_title', {
                  name: $t(`action_type_selector.types.${actionGroup}.title`),
                }),
                description: $t('modals.actions.add.custom_description'),
              }
        "
        :steps="steps"
      />
    </template>

    <section class="action-body">
      <StepSelectActionType
        v-if="currentStep.name === 'select_action_type'"
        v-model:actionType="actionType"
        v-model:name="name"
      />

      <StepDescribe
        v-if="currentStep.name === 'describe'"
        v-model:description="description"
        v-model:actionType="actionType"
        :currentActions="currentActions"
      />

      <StepSelectFlow
        v-if="currentStep.name === 'select_flow'"
        v-model:flowUuid="flowUuid"
        :name="name"
        :items="items"
        :currentActions="currentActions"
        @update:name="isCustom ? (name = $event) : null"
      />

      <StepNominateAction
        v-if="currentStep.name === 'nominate_action'"
        v-model:name="name"
        :loading="loadingGenerateName"
      />
    </section>
  </UnnnicModalDialog>
</template>

<script>
import { useStore } from 'vuex';
import { usePagination } from '@/views/ContentBases/pagination';
import nexusaiAPI from '../../api/nexusaiAPI';
import LeftSidebar from './LeftSidebar.vue';
import StepSelectFlow from './steps/SelectFlow.vue';
import StepDescribe from './steps/Describe.vue';
import StepNominateAction from './steps/NominateAction.vue';
import StepSelectActionType from './steps/SelectActionType.vue';

export default {
  components: {
    LeftSidebar,
    StepSelectActionType,
    StepDescribe,
    StepSelectFlow,
    StepNominateAction,
  },

  props: {
    actionGroup: {
      type: String,
      required: true,
    },

    currentActions: {
      type: Array,
      default() {
        return [];
      },
      required: false,
    },
  },

  emits: ['update:modelValue', 'added'],

  setup() {
    const store = useStore();

    const items = usePagination({
      load: {
        request: nexusaiAPI.router.actions.flows.list,
        params: {
          projectUuid: store.state.Auth.connectProjectUuid,
          name: '',
        },
      },
    });

    return { items };
  },

  data() {
    return {
      isAdding: false,

      currentStepIndex: 0,

      name: '',
      loadingGenerateName: false,
      description: '',
      actionType: 'custom',
      flowUuid: '',
    };
  },

  computed: {
    isCustom() {
      return this.actionGroup === 'custom';
    },

    steps() {
      const steps = [];

      if (this.isCustom) {
        steps.push({
          name: 'describe',
          title: this.$t('modals.actions.add.steps.describe.title'),
        });
      } else {
        steps.push({
          name: 'select_action_type',
          title: this.$t('modals.actions.add.steps.describe.title'),
        });
      }

      steps.push({
        name: 'select_flow',
        title: this.$t('modals.actions.add.steps.select_flow.title'),
      });

      if (this.isCustom) {
        steps.push({
          name: 'nominate_action',
          title: this.$t('modals.actions.add.steps.nominate_action.title'),
        });
      }

      return steps.map((step, index) => ({
        ...step,
        active: index === this.currentStepIndex,
      }));
    },

    firstStep() {
      return this.steps.at(0);
    },

    lastStep() {
      return this.steps.at(-1);
    },

    currentStep() {
      return this.steps.find(({ active }) => active);
    },

    isPrimaryButtonActive() {
      if (this.currentStep.name === 'describe') {
        return this.description.trim();
      }

      if (this.currentStep.name === 'select_flow') {
        return this.flowUuid;
      }

      if (this.currentStep.name === 'nominate_action') {
        return this.name.trim();
      }

      return true;
    },
  },

  methods: {
    close() {
      this.$emit('update:modelValue', false);
    },

    async addAction() {
      try {
        this.isAdding = true;

        const { data } = await nexusaiAPI.router.actions.create({
          projectUuid: this.$store.state.Auth.connectProjectUuid,
          name: this.name,
          description: this.actionType === 'custom' ? this.description : '',
          flowUuid: this.flowUuid,
          action_type: this.actionType,
        });

        const createdAction = {
          uuid: data.uuid,
          name: data.name,
          description: data.prompt,
          actionType: data.action_type,
        };

        this.$store.state.alert = {
          type: 'success',
          text: this.$t('modals.actions.add.messages.success', {
            name: createdAction.name,
          }),
        };

        this.$emit('added', createdAction);
      } finally {
        this.isAdding = false;

        this.close();
      }
    },

    goToPreviousStep() {
      if (this.currentStep !== this.firstStep) {
        this.currentStepIndex -= 1;
      }
    },

    goToNextStep() {
      if (this.currentStep === this.lastStep) {
        this.addAction();
      } else {
        if (this.isNeedGenerateName()) this.generateActionName();
        this.currentStepIndex += 1;
      }
    },

    async generateActionName() {
      this.loadingGenerateName = true;

      try {
        const response =
          await nexusaiAPI.router.actions.generatedNames.generate({
            projectUuid: this.$store.state.Auth.connectProjectUuid,
            chatbot_goal: this.$t(
              'modals.actions.add.steps.generate_action_name.chatbot_goal',
            ),
            context: this.$t(
              'modals.actions.add.steps.generate_action_name.context',
              {
                description: this.description,
              },
            ),
          });

        this.name = response.data.action_name;
      } finally {
        this.loadingGenerateName = false;
      }
    },

    isNeedGenerateName() {
      return this.currentStep.name === 'select_flow';
    },
  },
};
</script>

<style lang="scss" scoped>
.action-body {
  height: 22 * $unnnic-font-size;
  display: flex;
  flex-direction: column;
}

.flow-modal {
  :deep(.unnnic-modal-container-background) {
    width: 100%;
    max-width: 37.75 * $unnnic-font-size;
  }

  :deep(.unnnic-modal-container-background-body-description-container) {
    padding-bottom: 0;
  }

  &__container {
    display: flex;
    flex-direction: column;
  }

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: $unnnic-spacing-md;

    &__fill {
      display: flex;
      align-items: flex-start;
      gap: $unnnic-spacing-xs;

      &__container {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      &__bar {
        width: 7.8125rem;
        height: 0.5rem;
        border-radius: $unnnic-border-radius-pill;
        background: $unnnic-color-neutral-soft;

        &--green {
          background: $unnnic-color-weni-600;
        }
      }
    }
  }
}
</style>
