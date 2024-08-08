import { flushPromises, mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import Brain from '@/views/Brain/Brain.vue';
import RouterContentBase from '@/views/Brain/RouterContentBase.vue';
import RouterActions from '@/views/Brain/RouterActions.vue';
import RouterTunings from '@/views/Brain/RouterTunings.vue';
import RouterCustomization from '@/views/Brain/RouterCustomization.vue';
import ModalPreviewQRCode from '@/views/Brain/Preview/ModalPreviewQRCode.vue';
import ModalSaveChangesError from '@/views/Brain/ModalSaveChangesError.vue';
import Tests from '@/views/repository/content/Tests.vue';
import nexusaiAPI from '@/api/nexusaiAPI';
import { expect } from 'vitest';
import { createWebHistory, createRouter } from 'vue-router';
import Home from '@/views/Home.vue';

const store = createStore({
  state() {
    return {
      Brain: {
        isSavingChanges: false,
        tabsWithError: null,
        contentText: {
          current: '',
          old: '',
        },
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
      router: {
        contentBaseUuid: 'store-content-uuid',
        intelligenceUuid: 'store-intelligence-uuid',
      },
      Auth: {
        connectProjectUuid: 'store-connect-uuid',
      },
    };
  },
  getters: {
    isBrainSaveButtonDisabled: () => false,
  },
  actions: {
    saveBrainChanges: vi.fn(),
    loadBrainCustomization: vi.fn(),
    loadBrainTunings: vi.fn(),
  },
});

const router = createRouter({
  mode: 'history',
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: Home },
    {
      path: '/router',
      name: 'router',
      component: Brain,
      redirect: () => {
        return { name: 'router-personalization' };
      },
      async beforeEnter(_to, _from, next) {
        const { data } = await nexusaiAPI.router.read({
          projectUuid: store.state.Auth.connectProjectUuid,
          obstructiveErrorProducer: true,
        });

        store.state.router.contentBaseUuid = data.uuid;
        store.state.router.intelligenceUuid = data.intelligence;

        next();
      },
      children: [
        {
          path: 'personalization',
          name: 'router-personalization',
          component: () => import('@/views/Brain/RouterCustomization.vue'),
        },
        {
          path: 'content',
          name: 'router-content',
          component: () => import('@/views/Brain/RouterCustomization.vue'),
        },
        {
          path: 'actions',
          name: 'router-actions',
          component: () => import('@/views/Brain/RouterActions.vue'),
        },
        {
          path: 'tunings',
          name: 'router-tunings',
          component: () => import('@/views/Brain/RouterTunings.vue'),
        },
      ],
    },
  ],
});

vi.mock('@/views/ContentBases/filesPagination', () => ({
  useFilesPagination: vi.fn().mockReturnValue({
    loadNext: vi.fn(),
    data: [
      { id: 1, name: 'File 1' },
      { id: 2, name: 'File 2' },
    ],
  }),
}));

vi.mock('@/views/ContentBases/sitesPagination', () => ({
  useSitesPagination: vi.fn().mockReturnValue({
    loadNext: vi.fn(),
    data: [
      { id: 1, name: 'Site 1' },
      { id: 2, name: 'Site 2' },
    ],
  }),
}));

vi.spyOn(nexusaiAPI.router.tunings.advanced, 'read').mockResolvedValue({
  data: {
    brain_on: false,
  },
});

vi.spyOn(nexusaiAPI, 'readIntelligenceContentBase').mockResolvedValue({
  data: {
    title: 'title',
    description: 'description',
    language: 'pt-br',
  },
});

vi.spyOn(nexusaiAPI.router, 'read').mockResolvedValue({
  data: {
    uuid: 'router-uuid',
    intelligence: 'router-intelligence',
  },
});

vi.spyOn(nexusaiAPI.router.actions, 'list').mockResolvedValue({
  data: [
    {
      uuid: '1',
      name: 'Action 1',
      prompt: 'Description 1',
      content_base: '4',
    },
  ],
});

vi.spyOn(nexusaiAPI.intelligences.contentBases.texts, 'list').mockResolvedValue(
  {
    data: {
      results: [
        {
          uuid: 'test-text-uuid',
          text: 'Sample text content',
        },
      ],
    },
  },
);

describe('Brain integration', () => {
  let wrapper;
  let dispatchSpy;

  beforeEach(async () => {
    router.push('/router');
    await router.isReady();
    dispatchSpy = vi.spyOn(store, 'dispatch');

    wrapper = mount(Brain, {
      global: {
        plugins: [store, router],
        components: {
          RouterContentBase,
          RouterActions,
          RouterTunings,
          ModalSaveChangesError,
          ModalPreviewQRCode,
          RouterCustomization,
          Tests,
        },
      },
    });
  });

  test('check if all routes render the correct component when accessed by tabs', async () => {
    const customizationComponent = wrapper.findComponent(RouterCustomization);
    expect(customizationComponent.exists()).toBe(true);

    const tabs = wrapper.findAll('.tab-head');

    expect(tabs.length).eq(4);
    await tabs.at(1).trigger('click');

    await flushPromises();

    const contentComponent = wrapper.findComponent(RouterContentBase);
    expect(contentComponent.exists()).toBe(true);

    await tabs.at(2).trigger('click');

    await flushPromises();

    const actionsComponent = wrapper.findComponent(RouterActions);
    expect(actionsComponent.exists()).toBe(true);

    await tabs.at(3).trigger('click');

    await flushPromises();

    const tuningsComponent = wrapper.findComponent(RouterTunings);
    expect(tuningsComponent.exists()).toBe(true);
  });

  test('checking that the personalization tab is saving the entries provided and performing the save', async () => {

    const tabs = wrapper.findAll('.tab-head');

    await tabs.at(0).trigger('click');
    
    await flushPromises();

    const customizationComponent = wrapper.findComponent(RouterCustomization);

    expect(customizationComponent.exists()).toBe(true);

    const nameInput = wrapper.findComponent('[data-test="input-name"]');
    const roleInput = wrapper.findComponent('[data-test="input-role"]');
    const personalitySelect = wrapper.findComponent('[data-test="select-personality"]');
    const goalTextArea = wrapper.findComponent('[data-test="textarea"]');

    await nameInput.setValue('Test Name');
    await roleInput.setValue('Test Role');
    await personalitySelect.vm.$emit('update:model-value', [
      { value: 'Amigável' },
    ]);
    await goalTextArea.setValue('Test Goal');


    expect(store.state.Brain.agent.name.current).toBe('Test Name');
    expect(store.state.Brain.agent.role.current).toBe('Test Role');
    expect(store.state.Brain.agent.personality.current).toBe('Amigável');
    expect(store.state.Brain.agent.goal.current).toBe('Test Goal');

    const addButton = wrapper.findComponent(
      '[data-test="btn-add-instruction"]',
    );

    await addButton.trigger('click');

    expect(store.state.Brain.instructions.current.length).toBe(1);

    const firstInstructionInput = wrapper.findComponent(
      '[data-test="instruction-0"]',
    );
    await firstInstructionInput.setValue('instruction 01');

    expect(store.state.Brain.instructions.current[0].instruction).toBe(
      'instruction 01',
    );
    
    const deleteButtonFirstInstruction = wrapper.findComponent(
      '[data-test="btn-delete-inst-0"]',
    );

    await deleteButtonFirstInstruction.trigger('click');

    const removeModal = wrapper.findComponent('[data-test="remove-modal"]');

    expect(removeModal.exists()).toBe(true);

    const removeInstructionBtn = wrapper.findComponent('[data-test="btn-remove-inst"]');
    
    await removeInstructionBtn.trigger('click')

    expect(store.state.Brain.instructions.current.length).toBe(1);

    await addButton.trigger('click');

    const secondInstInput = wrapper.findComponent(
      '[data-test="instruction-0"]',
    );
    await secondInstInput.setValue('instruction 02');

    expect(store.state.Brain.instructions.current[0].instruction).toBe(
      'instruction 02',
    );

    const saveBtn = wrapper.findComponent('.save-button');

    await saveBtn.trigger('click');

    expect(dispatchSpy).toHaveBeenCalledWith('saveBrainChanges');
  })
});
