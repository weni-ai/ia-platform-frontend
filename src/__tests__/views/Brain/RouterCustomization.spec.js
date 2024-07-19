import { mount, flushPromises } from '@vue/test-utils';
import RouterCustomization from '@/views/Brain/RouterCustomization.vue';
import nexusaiAPI from '@/api/nexusaiAPI';
import FieldErrorRequired from '@/views/Brain/Preview/FieldErrorRequired.vue';
import { createStore } from 'vuex';
import { expect } from 'vitest';

const store = createStore({
  state() {
    return {
      Auth: {
        connectProjectUuid: 'test2323test',
      },
      Brain: {
        customizationStatus: 'idle',
        customizationErrorRequiredFields: {
          name: false,
          role: false,
          goal: false,
        },
        agent: {
          name: { current: '' },
          role: { current: '' },
          personality: { current: '' },
          goal: { current: '' },
        },
        instructions: {
          current: [],
          old: [],
        },
      },
      alert: null,
    };
  },
  actions: {
    loadBrainCustomization: vi.fn(),
  },
});

describe('RouterCustomization', () => {
  let wrapper;
  let dispatchSpy;

  beforeEach(() => {
    vi.clearAllMocks();

    dispatchSpy = vi.spyOn(store, 'dispatch');

    wrapper = mount(RouterCustomization, {
      global: {
        plugins: [store],
      },
    });
  });

  test('renders title and subtitle', () => {
    const title = wrapper.find('.customization-title');
    const subTitle = wrapper.find('.customization-sub_title');

    expect(title.exists()).toBe(true);
    expect(subTitle.exists()).toBe(true);
  });

  test('calls loadBrainCustomization on mount', () => {
    expect(dispatchSpy).toHaveBeenCalledWith('loadBrainCustomization');
  });

  test('renders input fields and handles input changes', async () => {
    const nameInput = wrapper.findComponent({ name: 'UnnnicInput' });
    const roleInput = wrapper.findAllComponents({ name: 'UnnnicInput' })[1];
    const personalitySelect = wrapper.findComponent({
      name: 'UnnnicSelectSmart',
    });
    const goalTextArea = wrapper.findComponent('[data-test="textarea"]');

    await nameInput.setValue('Test Name');
    await roleInput.setValue('Test Role');
    await personalitySelect.vm.$emit('update:model-value', [
      { value: 'Amigável' },
    ]);
    await goalTextArea.setValue('Test Goal');

    expect(wrapper.vm.brain.agent.name.current).toBe('Test Name');
    expect(wrapper.vm.brain.agent.role.current).toBe('Test Role');
    expect(wrapper.vm.brain.agent.personality.current).toBe('Amigável');
    expect(wrapper.vm.brain.agent.goal.current).toBe('Test Goal');
  });

  test('adds and removes instructions if instructions length equal 0', async () => {
    await wrapper.vm.addInstruction();

    expect(wrapper.vm.brain.instructions.current.length).toBe(1);

    wrapper.vm.handleShowRemoveModal(0);
    expect(wrapper.vm.showRemoveModal).toBe(true);

    nexusaiAPI.router.customization.delete = vi.fn().mockResolvedValue({});

    await wrapper.vm.removeInstruction();
    await flushPromises();

    expect(wrapper.vm.brain.instructions.current.length).toBe(1);
    expect(wrapper.vm.showRemoveModal).toBe(false);
  });

  test('adds and removes instructions if instructions length bigger then 0', async () => {
    const firstInstructionInput = wrapper.findComponent(
      '[data-test="instruction-0"]',
    );
    await firstInstructionInput.setValue('instruction 01');

    expect(wrapper.vm.brain.instructions.current[0].instruction).toBe(
      'instruction 01',
    );

    await wrapper.vm.addInstruction();

    const secondInstructionInput = wrapper.findComponent(
      '[data-test="instruction-1"]',
    );
    await secondInstructionInput.setValue('instruction 02');
    expect(wrapper.vm.brain.instructions.current[1].instruction).toBe(
      'instruction 02',
    );

    expect(wrapper.vm.brain.instructions.current.length).toBe(2);

    wrapper.vm.handleShowRemoveModal(1);
    expect(wrapper.vm.showRemoveModal).toBe(true);

    nexusaiAPI.router.customization.delete = vi.fn().mockResolvedValue({});

    await wrapper.vm.removeInstruction();
    await flushPromises();

    const secondInstruction = wrapper.vm.brain.instructions.current.find(
      (e) => e.instruction === 'instruction 02',
    );
    expect(wrapper.vm.brain.instructions.current.length).toBe(1);
    expect(secondInstruction).toBeUndefined();
    expect(wrapper.vm.showRemoveModal).toBe(false);
  });

  test('shows loading elements', async () => {
    store.state.Brain.customizationStatus = 'loading';

    await wrapper.vm.$nextTick();

    const loadingElements = wrapper.findAllComponents({
      name: 'LoadingFormElement',
    });

    expect(loadingElements.length).toBeGreaterThan(0);
  });

  test('handles validation errors', async () => {
    store.state.Brain.customizationStatus = 'idle';
    store.state.Brain.customizationErrorRequiredFields.name = true;
    store.state.Brain.customizationErrorRequiredFields.role = true;
    store.state.Brain.customizationErrorRequiredFields.goal = true;

    await wrapper.vm.$nextTick();
    const errorFields = wrapper.findAllComponents(FieldErrorRequired);

    expect(errorFields.length).toBe(3);
  });

  test('emits appropriate events', async () => {
    store.state.Brain.customizationStatus = 'idle';

    await wrapper.vm.$nextTick();

    const addButton = wrapper.findComponent(
      '[data-test="btn-add-instruction"]',
    );

    await addButton.trigger('click');

    expect(wrapper.vm.brain.instructions.current.length).toBe(2);
  });
});
