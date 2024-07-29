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
      <LeftSidebar :steps="steps" />
    </template>

    <section class="action-body">
      <StepDescribe
        v-if="currentStep.name === 'describe'"
        v-model:description="description"
      />

      <StepSelectFlow
        v-if="currentStep.name === 'select_flow'"
        v-model:flowUuid="flowUuid"
        v-model:name="name"
        :items="items"
        :currentActions="currentActions"
      />

      <StepNominateAction
        v-if="currentStep.name === 'nominate_action'"
        v-model:name="name"
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

export default {
  components: {
    LeftSidebar,
    StepDescribe,
    StepSelectFlow,
    StepNominateAction,
  },

  props: {
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
      description: '',
      flowUuid: '',
    };
  },

  computed: {
    steps() {
      return [
        {
          name: 'describe',
          title: this.$t('modals.actions.add.steps.describe.title'),
        },
        {
          name: 'select_flow',
          title: this.$t('modals.actions.add.steps.select_flow.title'),
        },
        {
          name: 'nominate_action',
          title: this.$t('modals.actions.add.steps.nominate_action.title'),
        },
      ].map((step, index) => ({
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
          description: this.description,
          flowUuid: this.flowUuid,
        });

        const createdAction = {
          uuid: data.uuid,
          name: data.name,
          description: data.prompt,
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
      const response = await nexusaiAPI.router.actions.generatedNames.generate({
        projectUuid: this.$store.state.Auth.connectProjectUuid,
        chatbot_goal:
          'Chatbot que sugere nomes para ações baseado na descrição informada',
        context: `Descrição: ${this.description}`,
      });

      this.name = response.data.action_name;
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
