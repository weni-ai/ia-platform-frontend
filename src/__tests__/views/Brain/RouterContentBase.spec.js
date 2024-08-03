import { mount, flushPromises } from '@vue/test-utils';
import RouterContentBase from '@/views/Brain/RouterContentBase.vue';
import BasesFormFiles from '@/views/repository/content/BasesFormFiles.vue';
import BasesFormSites from '@/views/repository/content/BasesFormSites.vue';
import BasesFormGenericListHeader from '@/views/repository/content/BasesFormGenericListHeader.vue';
import BasesFormText from '@/views/repository/content/BasesFormText.vue';
import { createStore } from 'vuex';
import { expect } from 'vitest';

const store = createStore({
  state() {
    return {
      Brain: {
        contentText: {
          current: '',
        },
      },
      mutations: {
        updateContentText(state, text) {
          state.Brain.contentText.current = text;
        },
      },
    };
  },
});

describe('RouterContentBase', () => {
  let wrapper;

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
        filterNameProp: '',
        filesProp: mockFilesProp,
        sitesProp: mockSitesProp,
        textProp: mockTextProp,
      },
      global: {
        plugins: [store],
        components: {
          BasesFormFiles,
          BasesFormSites,
          BasesFormGenericListHeader,
          BasesFormText,
        },
      },
    });
  });

  test('renders correctly with initial props', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'UnnnicInput' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'BasesFormFiles' }).exists()).toBe(
      true,
    );
    expect(wrapper.findComponent({ name: 'BasesFormSites' }).exists()).toBe(
      true,
    );
  });

  test('updates filter name when input changes', async () => {
    const inputComponent = wrapper.findComponent({ name: 'UnnnicInput' });
    inputComponent.vm.$emit('update:model-value', 'New Filter');
    await flushPromises();

    expect(wrapper.emitted()['update:filterName']).toBeTruthy();
    expect(wrapper.emitted()['update:filterName'][0]).toEqual(['New Filter']);
  });

  test('emits "update:filterName" when updateFilterName is called', async () => {
    wrapper.vm.updateFilterName('New Filter Name');
    await flushPromises();

    expect(wrapper.emitted()['update:filterName']).toBeTruthy();
    expect(wrapper.emitted()['update:filterName'][0]).toEqual([
      'New Filter Name',
    ]);
  });

  test('displays skeleton loader when files are loading', async () => {
    await wrapper.setProps({
      filesProp: { status: 'loading', data: [] },
    });
    wrapper.vm.contentStyle = 'list';
    await flushPromises();

    expect(
      wrapper.findComponent({ name: 'UnnnicSkeletonLoading' }).exists(),
    ).toBe(true);
  });

  test('filesProp are empty', async () => {
    await wrapper.setProps({
      filesProp: { status: 'complete', data: [] },
    });
    await flushPromises();

    expect(wrapper.vm.filesProp).toEqual({ status: 'complete', data: [] });
  });

  test('does not display skeleton loader when contentStyle is not accordion', async () => {
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

  test('content-base__content-tab--shape when contentStyle is different', async () => {
    wrapper.vm.contentStyle = 'different';
    await flushPromises();

    expect(
      wrapper.find('.content-base__content-tab--shape-different').exists(),
    ).toBe(true);
  });

  test('renders correct elements based on props', async () => {
    await wrapper.setProps({
      filesProp: { status: 'complete', data: [] },
    });
    await flushPromises();

    expect(wrapper.findComponent({ name: 'BasesFormFiles' }).exists()).toBe(
      true,
    );
    expect(wrapper.findComponent({ name: 'BasesFormSites' }).exists()).toBe(
      true,
    );
  });

  test('renders BasesFormText when textProp.open is true', async () => {
    await wrapper.setProps({
      textProp: { ...mockTextProp, open: true },
    });
    await flushPromises();

    const textComponent = wrapper.findComponent(BasesFormText);
    expect(textComponent.exists()).toBe(true);
    expect(textComponent.props('item')).toEqual({
      open: true,
      content: 'Sample Text',
    });
    expect(textComponent.classes()).toContain(
      'content-base__content-tab__text',
    );
  });

  test('updates Vuex store state when BasesFormText emits input event', async () => {
    await wrapper.setProps({
      textProp: { ...mockTextProp, open: true },
    });
    await flushPromises();

    const textComponent = wrapper.findComponent(BasesFormText);

    textComponent.vm.$emit('update:modelValue', 'Updated Text');
    await flushPromises();

    expect(store.state.Brain.contentText.current).toBe('Updated Text');
  });

  test('renders BasesFormSites with correct items', async () => {
    await wrapper.setProps({
      sitesProp: { data: [{ name: 'Site 3' }, { name: 'Site 4' }] },
    });
    await flushPromises();

    const sitesComponent = wrapper.findComponent(BasesFormSites);
    expect(sitesComponent.exists()).toBe(true);
    expect(sitesComponent.props('items')).toEqual({
      data: [{ name: 'Site 3' }, { name: 'Site 4' }],
    });
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

  test('mounts all child components', async () => {
    await wrapper.setProps({
      textProp: { ...mockTextProp, open: true },
    });
    await flushPromises();
    expect(wrapper.findComponent(BasesFormFiles).exists()).toBe(true);
    expect(wrapper.findComponent(BasesFormSites).exists()).toBe(true);
    expect(wrapper.findComponent(BasesFormGenericListHeader).exists()).toBe(
      true,
    );
    expect(wrapper.findComponent(BasesFormText).exists()).toBe(true);
  });

  test('does not render BasesFormText when textProp.open is false', async () => {
    await wrapper.setProps({
      textProp: { ...mockTextProp, open: false },
    });
    await flushPromises();

    const textComponent = wrapper.findComponent(BasesFormText);
    expect(textComponent.exists()).toBe(false);
  });

  test('updates filter name when filterNameProp changes', async () => {
    await wrapper.setProps({ filterNameProp: 'New Filter' });
    await flushPromises();

    expect(
      wrapper.findComponent({ name: 'UnnnicInput' }).props('modelValue'),
    ).toBe('New Filter');
  });

  test('updates filter name when filterNameProp is empty', async () => {
    await wrapper.setProps({ filterNameProp: '' });
    await flushPromises();

    expect(
      wrapper.findComponent({ name: 'UnnnicInput' }).props('modelValue'),
    ).toBe('');
  });

  test('updates filter name when filterNameProp is undefined', async () => {
    await wrapper.setProps({ filterNameProp: undefined });
    await flushPromises();

    expect(
      wrapper.findComponent({ name: 'UnnnicInput' }).props('modelValue'),
    ).toBe('');
  });
});
