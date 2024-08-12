import { mount, flushPromises } from '@vue/test-utils';
import RouterTunings from '@/views/Brain/RouterTunings.vue';
import nexusaiAPI from '@/api/nexusaiAPI';
import { createStore } from 'vuex';
import { describe, beforeEach, vi, test, expect } from 'vitest';
import { brainTuningsFields } from '@/__tests__/mocks/brainTuningsFields.js';

const store = createStore({
  state() {
    return {
      Auth: {
        connectProjectUuid: 'test2323test',
      },
      Brain: {
        tuningsStatus: 'loaded',
        tuningsFields: brainTuningsFields,
      },
      modalWarn: null,
      alert: null,
    };
  },
  getters: {
    brainTuningsFields: (state) => state.Brain.tuningsFields,
  },
  mutations: {
    updateTuning: vi.fn(),
    setBrainTuningsInitialValues: vi.fn(),
    setTuningsFields(state, fields) {
      state.Brain.tuningsFields = fields;
    },
  },
  actions: {
    loadBrainTunings: vi.fn(),
  },
});

describe('RouterTunings', () => {
  let wrapper;
  let dispatchSpy;
  let commitSpy;

  beforeEach(() => {
    vi.clearAllMocks();

    nexusaiAPI.router.tunings.restoreDefault = vi
      .fn()
      .mockResolvedValue({ data: {} });

    dispatchSpy = vi.spyOn(store, 'dispatch');
    commitSpy = vi.spyOn(store, 'commit');

    wrapper = mount(RouterTunings, {
      props: {
        data: {
          brainOn: false,
        },
      },
      global: {
        plugins: [store],
      },
    });
  });

  test('renders the component correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('calls loadBrainTunings on mount', () => {
    expect(dispatchSpy).toHaveBeenCalledWith('loadBrainTunings');
  });

  test('renders default labels correctly', async () => {
    await flushPromises();

    const modelLabel = wrapper
      .findAllComponents({ name: 'UnnnicIntelligenceText' })
      .filter((component) =>
        component.text().includes(wrapper.vm.$t('router.tunings.model')),
      );
    expect(modelLabel.length).toBeGreaterThan(0);

    const selectModelLabel = wrapper
      .findAllComponents({ name: 'UnnnicIntelligenceText' })
      .filter((component) =>
        component.text().includes(wrapper.vm.$t('router.tunings.fields.model')),
      );
    expect(selectModelLabel.length).toBeGreaterThan(0);

    const tokenSelectLabel = wrapper
      .findAllComponents({ name: 'UnnnicIntelligenceText' })
      .filter((component) =>
        component.text().includes(wrapper.vm.$t('router.tunings.fields.token')),
      );
    expect(tokenSelectLabel.length).toBeGreaterThan(0);
  });

  test('renders all default fields correctly', async () => {
    await flushPromises();

    const RadioModel = wrapper
      .find('.tunings__form-element__radio')
      .findAll('.label');

    expect(RadioModel[0].text()).toContain(
      brainTuningsFields.find((e) => e.name === 'model').options[0],
    );
    expect(RadioModel[1].text()).toContain(
      brainTuningsFields.find((e) => e.name === 'model').options[1],
    );

    const SelectVersion = wrapper.findComponent({
      name: 'UnnnicSelectSmart',
    });
    expect(SelectVersion.vm.modelValue[0].value).toContain(
      brainTuningsFields.find((e) => e.name === 'version').default.name,
    );

    const UnnnicSliders = wrapper.findAllComponents({ name: 'UnnnicSlider' });

    expect(UnnnicSliders[0].vm.initialValue).toEqual(
      brainTuningsFields.find((e) => e.name === 'temperature').value,
    );
  });

  test('updates a field value correctly', async () => {
    const slider = wrapper.findComponent({ name: 'UnnnicSlider' });
    await slider.vm.$emit('valueChange', 0.7);

    expect(commitSpy).toHaveBeenCalledWith('updateTuning', {
      name: 'temperature',
      value: 0.7,
    });
  });

  test('handles select field update correctly', async () => {
    const select = wrapper.findComponent({ name: 'UnnnicSelectSmart' });
    await select.vm.$emit('update:model-value', [{ value: 'Shark' }]);

    expect(store.commit).toHaveBeenCalledWith('updateTuning', {
      name: 'version',
      value: 'Shark',
    });
  });

  test('handles text input update correctly', async () => {
    const input = wrapper.findComponent({ name: 'UnnnicInput' });

    await input.vm.$emit('update:modelValue', 'new-token');

    expect(store.commit).toHaveBeenCalledWith('updateTuning', {
      name: 'token',
      value: 'new-token',
    });
  });

  test('opens restore default modal', async () => {
    const button = wrapper.find('.unnnic-button');
    await button.trigger('click');

    expect(store.state.modalWarn).toBeTruthy();
    expect(store.state.modalWarn.title).toBe(
      wrapper.vm.$t('router.tunings.restore_default_modal.title'),
    );
  });

  test('restores default values correctly', async () => {
    await wrapper.vm.restoreDefault();

    expect(nexusaiAPI.router.tunings.restoreDefault).toHaveBeenCalledWith({
      projectUuid: store.state.Auth.connectProjectUuid,
    });

    expect(store.commit).toHaveBeenCalledWith(
      'setBrainTuningsInitialValues',
      {},
    );
    expect(store.state.alert.type).toBe('success');
  });

  test('renders loading elements correctly', async () => {
    wrapper.vm.$store.state.Brain.tuningsStatus = 'loading';
    await wrapper.vm.$nextTick();

    const loadingElements = wrapper.findAllComponents({
      name: 'LoadingFormElement',
    });
    expect(loadingElements.length).toBe(2);
  });

  test('computes loadingData correctly', async () => {
    wrapper.vm.$store.state.Brain.tuningsStatus = 'loading';
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.loadingData).toBe(true);

    wrapper.vm.$store.state.Brain.tuningsStatus = 'loaded';
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.loadingData).toBe(false);
  });

  test('computes hasValidate correctly', async () => {
    wrapper.vm.$store.state.Brain.tuningsStatus = 'loaded';
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.hasValidate).toBe(false);

    store.commit('setTuningsFields', [
      ...brainTuningsFields,
      { name: 'testField', type: 'text', value: undefined },
    ]);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.hasValidate).toBe(true);
  });

  test('calls updateField correctly', async () => {
    wrapper.vm.updateField('model', 'newModel');
    expect(commitSpy).toHaveBeenCalledWith('updateTuning', {
      name: 'model',
      value: 'newModel',
    });
  });

  test('calls handleUpdateSelect correctly', async () => {
    const field = brainTuningsFields.find((e) => e.name === 'version');
    const selectSmart = wrapper.vm.useSelectSmart(field);

    expect(selectSmart.value[0].value).toBe(field.default.name);

    expect(selectSmart.options).toEqual(
      field.options.map((e) => ({
        description: wrapper.vm.$t(e.description),
        label: e.name,
        value: e.name,
      })),
    );

    const select = wrapper.findComponent({ name: 'UnnnicSelectSmart' });
    await select.vm.$emit('update:model-value', [{ value: 'newVersion' }]);

    expect(commitSpy).toHaveBeenCalledWith('updateTuning', {
      name: 'version',
      value: 'newVersion',
    });

    expect(select.props().orderedByIndex).toBe(true);
  });

  test('calls useSelectSmart correctly', async () => {
    const field = brainTuningsFields.find((e) => e.name === 'version');
    const selectSmart = wrapper.vm.useSelectSmart(field);
    expect(selectSmart.value[0].value).toBe(field.default.name);
  });

  test('renders advanced fields correctly', async () => {
    await flushPromises();
    const advancedFields = wrapper.findComponent({
      name: 'RouterTuningsAdvanced',
    });

    expect(advancedFields.exists()).toBe(true);

    const nafHeader = advancedFields
      .findAll('.unnnic-text')
      .filter((component) =>
        component
          .text()
          .includes(wrapper.vm.$t('router.tunings.fields.parameter')),
      );
    expect(nafHeader.length).toBeGreaterThan(0);

    const sliders = advancedFields.findAllComponents({ name: 'UnnnicSlider' });
    expect(sliders.length).toBeGreaterThan(0);
  });

  test('initializes correctly with different tuningsStatus', async () => {
    wrapper.vm.$store.state.Brain.tuningsStatus = 'error';
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.loadingData).toBe(false);
  });

  test('handles invalid field update correctly', async () => {
    await wrapper.vm.updateField('invalidField', 'value');
    expect(commitSpy).not.toHaveBeenCalled();
  });

  test('check that the isOneOption method is correct', async () => {
    const fieldOneOption = {
      options: [
        {
          name: 'shark-1',
        },
      ],
    };

    const fieldTwoOption = {
      options: [
        {
          name: 'shark-1',
        },
        {
          name: 'golfinho-1',
        },
      ],
    };

    const isOne = await wrapper.vm.isOneOption(fieldOneOption);

    expect(isOne).toBe(true);

    const isTwo = await wrapper.vm.isOneOption(fieldTwoOption);

    expect(isTwo).toBe(false);
  });
});
