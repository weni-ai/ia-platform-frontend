import { flushPromises, mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import Brain from '@/views/Brain/Brain.vue';
import RouterContentBase from '@/views/Brain/RouterContentBase.vue';
import RouterActions from '@/views/Brain/RouterActions.vue';
import RouterTunings from '@/views/Brain/RouterTunings.vue';
import ModalPreviewQRCode from '@/views/Brain/Preview/ModalPreviewQRCode.vue';
import ModalSaveChangesError from '@/views/Brain/ModalSaveChangesError.vue';
import Tests from '@/views/repository/content/Tests.vue';
import nexusaiAPI from '@/api/nexusaiAPI';
import { expect } from 'vitest';
import { useRouter, useRoute } from 'vue-router';

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
  },
});

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn(() => ({
    push: () => {},
  })),
}));

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

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
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

describe('Brain Component', () => {
  let wrapper;
  let dispatchSpy;
  let pushMock;
  beforeEach(() => {
    useRoute.mockImplementationOnce(() => ({
      name: 'router-personalization',
      params: {
        contentBaseUuid: 'uuuid-01',
      },
    }));

    pushMock = vi.fn();

    useRouter.mockImplementationOnce(() => ({
      push: pushMock,
    }));

    dispatchSpy = vi.spyOn(store, 'dispatch');

    wrapper = mount(Brain, {
      global: {
        plugins: [store],
        components: {
          RouterContentBase,
          RouterActions,
          RouterTunings,
          ModalSaveChangesError,
          Tests,
        },
        stubs: {
          RouterLink: true,
          RouterView: true,
          RouterCustomization: true,
          ModalPreviewQRCode: true,
        },
      },
    });
  });

  test('renders correctly with initial props and store state', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.findComponent('.save-button').exists()).toBe(true);
  });

  test('loads content base data correctly', async () => {
    const mockData = {
      title: 'Test Title',
      description: 'Test Description',
      language: 'en',
    };
    const mockTextData = 'Test Text';
    const mockUuid = 'test-uuid';

    nexusaiAPI.readIntelligenceContentBase.mockResolvedValue({
      data: mockData,
    });
    nexusaiAPI.intelligences.contentBases.texts.list.mockResolvedValue({
      data: {
        results: [
          {
            uuid: mockUuid,
            text: mockTextData,
          },
        ],
      },
    });

    await wrapper.vm.loadContentBase();

    expect(wrapper.vm.contentBase.title).toBe(mockData.title);
    expect(wrapper.vm.contentBase.description).toBe(mockData.description);
    expect(wrapper.vm.contentBase.language).toBe(mockData.language);
    expect(wrapper.vm.text.value).toBe(mockTextData);
    expect(wrapper.vm.text.oldValue).toBe(mockTextData);
    expect(wrapper.vm.text.uuid).toBe(mockUuid);
  });

  test('dispatches Vuex action on save button click', async () => {
    const button = wrapper.find('.save-button');
    await button.trigger('click');
    expect(dispatchSpy).toHaveBeenCalledWith('saveBrainChanges');
  });

  test('displays ModalSaveChangesError when tabsWithError is not null', async () => {
    store.state.Brain.tabsWithError = ['personalization'];
    await flushPromises();
    expect(wrapper.findComponent(ModalSaveChangesError).exists()).toBe(true);
  });

  test('toggles MobilePreviewModal when corresponding dropdown item is clicked', async () => {
    wrapper.vm.isMobilePreviewModalOpen = false;
    await flushPromises();

    expect(wrapper.findComponent(ModalPreviewQRCode).exists()).toBe(false);

    const dropdown = wrapper.findComponent('[data-test="dropdown-actions"]');
    await dropdown.trigger('click');
    await flushPromises();
    const dropdownItem = dropdown.find('[data-test="View from mobile"]');

    await dropdownItem.trigger('click');
    expect(wrapper.vm.isMobilePreviewModalOpen).toBe(true);
    await flushPromises();
    expect(wrapper.findComponent(ModalPreviewQRCode).exists()).toBe(true);
  });

  test('toggles RefreshPreview when corresponding dropdown item is clicked', async () => {
    const dropdown = wrapper.findComponent('[data-test="dropdown-actions"]');
    await dropdown.trigger('click');
    await flushPromises();
    const dropdownItem = dropdown.find('[data-test="Clear conversations"]');
    await dropdownItem.trigger('click');
    expect(wrapper.vm.refreshPreviewValue).toBe(1);
  });

  test('check that BrainOn has the correct value after using loadRouterOptions', async () => {
    vi.spyOn(nexusaiAPI.router.tunings.advanced, 'read').mockResolvedValue({
      data: {
        brain_on: true,
      },
    });

    await wrapper.vm.loadRouterOptions();
    await flushPromises();

    expect(wrapper.vm.routerTunings.brainOn).toBe(true);
  });

  test('does not call router.push if the active tab is the same', async () => {
    const currentRouteName = 'router-content';
    useRoute.mockImplementation(() => ({
      name: currentRouteName,
      params: {
        contentBaseUuid: 'uuuid-01',
      },
    }));

    wrapper = mount(Brain, {
      global: {
        plugins: [store],
        stubs: {
          RouterLink: true,
          RouterView: true,
        },
      },
    });

    const onTabChange = wrapper.vm.onTabChange;
    const activeTab = wrapper.vm.activeTab;

    onTabChange(currentRouteName);
    expect(pushMock).not.toHaveBeenCalled();
    expect(activeTab).eq(currentRouteName);
  });

  test('calls router.push with the correct route name when onTabChange is triggered', async () => {
    const tabs = wrapper.vm.routerTabs;
    const onTabChange = wrapper.vm.onTabChange;

    for (const tab of tabs) {
      if (wrapper.vm.route.name !== tab.page) {
        onTabChange(tab.page);
        expect(pushMock).toHaveBeenCalledWith({ name: tab.page });
      }
    }
  });

  test('contentBaseUuid returns route param value if available', () => {
    useRoute.mockReturnValue({
      params: { contentBaseUuid: 'route-content-uuid' },
    });

    wrapper = mount(Brain, {
      global: {
        plugins: [store],
        stubs: {
          RouterLink: true,
          RouterView: true,
        },
      },
    });

    expect(wrapper.vm.contentBaseUuid).toBe('route-content-uuid');
  });

  test('contentBaseUuid returns store value if route param is not available', () => {
    useRoute.mockReturnValue({
      params: {},
    });

    wrapper = mount(Brain, {
      global: {
        plugins: [store],
        stubs: {
          RouterLink: true,
          RouterView: true,
        },
      },
    });

    expect(wrapper.vm.contentBaseUuid).toBe('store-content-uuid');
  });

  test('intelligenceUuid returns route param value if available', () => {
    useRoute.mockReturnValue({
      params: { intelligenceUuid: 'route-intelligence-uuid' },
    });

    wrapper = mount(Brain, {
      global: {
        plugins: [store],
        stubs: {
          RouterLink: true,
          RouterView: true,
        },
      },
    });

    expect(wrapper.vm.intelligenceUuid).toBe('route-intelligence-uuid');
  });

  test('intelligenceUuid returns store value if route param is not available', () => {
    useRoute.mockReturnValue({
      params: {},
    });

    wrapper = mount(Brain, {
      global: {
        plugins: [store],
        stubs: {
          RouterLink: true,
          RouterView: true,
        },
      },
    });

    expect(wrapper.vm.intelligenceUuid).toBe('store-intelligence-uuid');
  });

  test('handles --empty-- text case correctly', async () => {
    nexusaiAPI.intelligences.contentBases.texts.list.mockResolvedValue({
      data: {
        results: [
          {
            uuid: 'test-text-uuid',
            text: '--empty--',
          },
        ],
      },
    });

    wrapper = mount(Brain, {
      global: {
        plugins: [store],
        stubs: {
          RouterLink: true,
          RouterView: true,
        },
      },
    });

    await flushPromises();

    expect(store.state.Brain.contentText.current).toBe('');
    expect(store.state.Brain.contentText.old).toBe('');
  });

  test('check if refreshPreview updates refreshPreviewValue correctly', async () => {
    expect(wrapper.vm.refreshPreviewValue).eq(0);

    for (const value of [1, 2, 3, 4, 5]) {
      wrapper.vm.refreshPreview();
      expect(wrapper.vm.refreshPreviewValue).eq(value);
    }
  });

  test('check if router components are rendered correctly based on route.name', async () => {
    const routes = [
      {
        title: 'personalization',
        page: 'router-personalization',
        component: 'RouterCustomization',
      },
      {
        title: 'content',
        page: 'router-content',
        component: 'RouterContentBase',
      },
      { title: 'actions', page: 'router-actions', component: 'RouterActions' },
      { title: 'tunings', page: 'router-tunings', component: 'RouterTunings' },
    ];

    const componentsActive = (componentName) => {
      return wrapper.findComponent({ name: componentName }).exists();
    };

    for (const { page, component } of routes) {
      useRoute.mockImplementationOnce(() => ({
        name: page,
        params: {
          contentBaseUuid: 'uuuid-01',
        },
      }));

      wrapper = mount(Brain, {
        global: {
          plugins: [store],
          stubs: {
            RouterLink: true,
            RouterView: true,
            RouterCustomization: true,
            RouterTunings: true,
            RouterActions: true,
            RouterContentBase: true,
          },
        },
      });

      await flushPromises();

      expect(componentsActive(component)).toBe(true);

      routes.forEach(({ component: otherComponent }) => {
        if (component !== otherComponent) {
          expect(componentsActive(otherComponent)).toBe(false);
        }
      });
    }
  });
});
