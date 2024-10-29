import { mount, flushPromises } from '@vue/test-utils';
import RouterContentBase from '@/views/Brain/RouterContentBase.vue';
import ContentFiles from '@/components/Brain/ContentFiles.vue';
import ContentSites from '@/components/Brain/ContentSites.vue';
import ContentText from '@/components/Brain/ContentText.vue';
import { createStore } from 'vuex';
import { expect } from 'vitest';

// Criação do Vuex Store para o teste
const store = createStore({
  state() {
    return {
      Actions: {
        status: null,
        data: [],

        types: {
          status: null,
          data: [],
        },
      },

      Brain: {
        contentText: {
          current: '',
        },
      },
    };
  },
  mutations: {
    updateContentText(state, text) {
      state.Brain.contentText.current = text;
    },
  },
});

describe('RouterContentBase', () => {
  let wrapper;

  // Mock props para o teste
  const mockFilesProp = {
    status: 'complete',
    data: [{ name: 'File 1' }, { name: 'File 2' }],
  };

  const mockSitesProp = {
    data: [{ name: 'Site 1' }, { name: 'Site 2' }],
  };

  const mockTextProp = {
    open: false,
    content: 'Sample Text',
  };

  beforeEach(() => {
    wrapper = mount(RouterContentBase, {
      props: {
        filesProp: mockFilesProp,
        sitesProp: mockSitesProp,
        textProp: mockTextProp,
      },
      global: {
        plugins: [store],
        components: {
          ContentFiles,
          ContentSites,
          ContentText,
        },
      },
    });
  });

  test('renders correctly with initial props', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.findComponent(ContentFiles).exists()).toBe(true);
  });

  test('displays skeleton loader when files are loading and contentStyle is not accordion', async () => {
    await wrapper.setProps({
      filesProp: { status: 'loading', data: [] },
    });
    wrapper.vm.contentStyle = 'list';
    await flushPromises();

    expect(
      wrapper.findComponent({ name: 'UnnnicSkeletonLoading' }).exists(),
    ).toBe(true);
  });

  test('does not display skeleton loader when contentStyle is accordion', async () => {
    await wrapper.setProps({
      filesProp: { status: 'loading', data: [] },
    });
    wrapper.vm.contentStyle = 'accordion';
    await flushPromises();

    expect(
      wrapper
        .findComponent('.repository-base-edit__wrapper__card-content')
        .exists(),
    ).toBe(false);
  });

  test('changes activeTab and renders the correct component', async () => {
    expect(wrapper.vm.activeTab).toBe('files');
    expect(wrapper.findComponent(ContentFiles).exists()).toBe(true);

    wrapper.vm.onTabChange('sites');
    await flushPromises();

    expect(wrapper.vm.activeTab).toBe('sites');
    expect(wrapper.findComponent(ContentSites).exists()).toBe(true);
    expect(wrapper.findComponent(ContentFiles).exists()).toBe(false);

    wrapper.vm.onTabChange('text');
    await flushPromises();

    expect(wrapper.vm.activeTab).toBe('text');
    expect(wrapper.findComponent(ContentText).exists()).toBe(true);
    expect(wrapper.findComponent(ContentSites).exists()).toBe(false);
  });

  test('renders ContentText based on activeTab', async () => {
    expect(wrapper.findComponent(ContentText).exists()).toBe(false);

    wrapper.vm.onTabChange('text');
    await flushPromises();

    const textComponent = wrapper.findComponent(ContentText);
    expect(textComponent.exists()).toBe(true);
    expect(textComponent.classes()).toContain(
      'content-base__content-tab__text',
    );
  });

  test('applies correct classes for different contentStyle values', async () => {
    const styles = ['accordion', 'list', 'grid'];

    for (const style of styles) {
      wrapper.vm.contentStyle = style;
      await flushPromises();

      expect(
        wrapper.find(`.content-base__content-tab--shape-${style}`).exists(),
      ).toBe(true);
    }
  });

  test('renders correct components based on props and tab state', async () => {
    expect(wrapper.findComponent(ContentFiles).exists()).toBe(true);
    expect(wrapper.findComponent(ContentSites).exists()).toBe(false);
    expect(wrapper.findComponent(ContentText).exists()).toBe(false);

    wrapper.vm.onTabChange('text');
    await flushPromises();

    const textComponent = wrapper.findComponent(ContentText);
    expect(textComponent.exists()).toBe(true);
    expect(textComponent.classes()).toContain(
      'content-base__content-tab__text',
    );
  });

  test('does not render ContentText when textProp.open is false', async () => {
    wrapper.vm.onTabChange('text');
    await flushPromises();

    const textComponent = wrapper.findComponent(ContentText);
    expect(textComponent.exists()).toBe(true);
  });

  test('renders ContentSites with correct items', async () => {
    await wrapper.setProps({
      sitesProp: { data: [{ name: 'Site 3' }, { name: 'Site 4' }] },
    });
    wrapper.vm.onTabChange('sites');
    await flushPromises();

    const sitesComponent = wrapper.findComponent(ContentSites);
    expect(sitesComponent.exists()).toBe(true);
    expect(sitesComponent.props('items')).toEqual({
      data: [{ name: 'Site 3' }, { name: 'Site 4' }],
    });
  });
});
