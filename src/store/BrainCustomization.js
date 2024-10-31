import nexusaiAPI from '@/api/nexusaiAPI';
import { defineStore } from 'pinia';
import { computed, reactive, ref, watch } from 'vue';
import globalStore from '.';
import { cloneDeep, differenceBy, get } from 'lodash';

export const useBrainCustomizationStore = defineStore(
  'brainCustomization',
  () => {
    const connectProjectUuid = computed(
      () => globalStore.state.Auth.connectProjectUuid,
    );

    const status = ref(null);
    const isSaving = ref(false);

    const name = reactive({
      current: '',
      old: '',
    });

    const role = reactive({
      current: '',
      old: '',
    });

    const personality = reactive({
      current: '',
      old: '',
    });

    const goal = reactive({
      current: '',
      old: '',
    });

    const instructions = reactive({
      current: '',
      old: '',
    });

    const errorRequiredFields = reactive({
      name: false,
      role: false,
      goal: false,
    });

    const hasChanged = computed(() => {
      return (
        [name, role, personality, goal].some(
          ({ current, old }) => current !== old,
        ) ||
        !!differenceBy(instructions.current, instructions.old, 'instruction')
          .length
      );
    });

    const isSaveButtonDisabled = computed(() => {
      const hasErrorRequiredFields =
        Object.values(errorRequiredFields).includes(true);

      return !hasChanged.value || hasErrorRequiredFields;
    });

    function setInitialValues(data) {
      name.old = name.current = data.agent?.['name'] || '';
      role.old = role.current = data.agent?.['role'] || '';
      personality.old = personality.current = data.agent?.['personality'] || '';
      goal.old = goal.current = data.agent?.['goal'] || '';

      instructions.current = data.instructions || [];

      if (instructions.current.length === 0) {
        instructions.current.push({
          instruction: '',
        });
      }

      instructions.old = cloneDeep(instructions.current);
    }

    async function load() {
      if (status.value !== null) {
        return;
      }

      try {
        status.value = 'loading';

        const { data } = await nexusaiAPI.router.customization.read({
          projectUuid: connectProjectUuid.value,
        });

        setInitialValues(data);

        status.value = 'complete';
      } catch {
        status.value = 'error';
      }
    }

    function validate() {
      const fields = [
        {
          id: 'name',
          field: name,
        },
        {
          id: 'role',
          field: role,
        },
        {
          id: 'goal',
          field: goal,
        },
      ];

      const unfilledFields = fields.filter(
        ({ field }) => !field.current.trim(),
      );

      unfilledFields.forEach(({ id, field }) => {
        errorRequiredFields[id] = true;

        watch(
          () => field.current,
          () => {
            errorRequiredFields[id] = false;
          },
          { once: true },
        );
      });

      if (unfilledFields.length) {
        throw {
          tab: 'personalization',
        };
      }
    }

    async function save() {
      try {
        validate();

        isSaving.value = true;

        const payload = {
          agent: {
            name: name.current,
            role: role.current,
            personality: personality.current,
            goal: goal.current,
          },
          instructions: instructions.current.filter(
            ({ instruction }) => instruction,
          ),
        };

        const { data } = await nexusaiAPI.router.customization.edit({
          projectUuid: connectProjectUuid.value,
          data: payload,
        });

        setInitialValues(data);
      } catch (error) {
        const tabWithError =
          get(error, 'tab') ||
          {
            'brain-customization-edit': 'personalization',
          }[get(error, 'config.routerName')];

        if (tabWithError) {
          globalStore.state.Brain.tabsWithError = [tabWithError];
        }
      } finally {
        isSaving.value = false;
      }
    }

    async function removeInstruction(instructionIndex) {
      const { id: removeId } = instructions.current[instructionIndex];

      if (removeId) {
        await nexusaiAPI.router.customization.delete({
          projectUuid: connectProjectUuid.value,
          id: removeId,
        });
      }

      instructions.current.splice(instructionIndex, 1);
      instructions.old.splice(instructionIndex, 1);
    }

    function addEmptyInstruction() {
      instructions.current.push({
        instruction: '',
      });

      instructions.old.push({
        instruction: '',
      });
    }

    return {
      status,
      isSaving,
      name,
      role,
      personality,
      goal,
      instructions,
      errorRequiredFields,
      hasChanged,
      isSaveButtonDisabled,

      load,
      validate,
      save,

      removeInstruction,
      addEmptyInstruction,
    };
  },
);
