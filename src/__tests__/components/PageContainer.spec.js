import { mount, RouterLinkStub } from '@vue/test-utils';
import PageContainer from '@/components/PageContainer.vue';
import { createStore } from 'vuex';
import { vi } from 'vitest';

describe('PageContainer', () => {
  let wrapper;

  const store = createStore({
    state() {
      return {
        someState: 'testState',
      };
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = mount(PageContainer, {
      props: {
        loadingTitle: false,
        title: 'Test Title',
        canEditTitle: true,
        description: 'Test Description',
        isNoSpaceContainer: false,
        dontShowBack: false,
      },
      global: {
        plugins: [store],
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    });
  });

  test('renders the component correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('applies correct classes based on isNoSpaceContainer prop', async () => {
    const container = wrapper.find('.content-bases-page-container');
    expect(container.exists()).toBe(true);
    expect(container.classes()).toContain('page-container-padding');
    expect(container.classes()).not.toContain('page-container--no-padding');

    await wrapper.setProps({ isNoSpaceContainer: true });
    expect(container.classes()).toContain('page-container--no-padding');
    expect(container.classes()).not.toContain('page-container-padding');
  });

  test('renders back button when dontShowBack is false', () => {
    const backButton = wrapper.findComponent('[data-test="back-btn"]');
    expect(backButton.exists()).toBe(true);
  });

  test('does not render back button when dontShowBack is true', async () => {
    await wrapper.setProps({ dontShowBack: true });
    const backButton = wrapper.findComponent('[data-test="back-btn"]');
    expect(backButton.exists()).toBe(false);
  });

  test('emits back event when back button is clicked', async () => {
    const backButton = wrapper.findComponent('[data-test="back-btn"]');
    await backButton.trigger('click');
    expect(wrapper.emitted('back')).toHaveLength(1);
  });

  test('renders title correctly and is editable when canEditTitle is true', async () => {
    const title = wrapper.find('.repository-base-edit__title');
    expect(title.text()).toBe('Test Title');
    expect(title.attributes('contenteditable')).toBe('true');

    await wrapper.vm.$emit('update:title', 'New Title');
    expect(wrapper.emitted('update:title')).toHaveLength(1);
    expect(wrapper.emitted('update:title')[0]).toEqual(['New Title']);
  });

  test('title is not editable when canEditTitle is false', async () => {
    await wrapper.setProps({ canEditTitle: false });
    const title = wrapper.find('.repository-base-edit__title');
    expect(title.attributes('contenteditable')).toBe('false');
  });

  test('renders skeleton loader when loadingTitle is true', async () => {
    await wrapper.setProps({ loadingTitle: true });
    const skeletonLoader = wrapper.findComponent({
      name: 'UnnnicSkeletonLoading',
    });
    expect(skeletonLoader.exists()).toBe(true);
  });

  test('does not render skeleton loader when loadingTitle is false', () => {
    const skeletonLoader = wrapper.findComponent({
      name: 'UnnnicSkeletonLoading',
    });
    expect(skeletonLoader.exists()).toBe(false);
  });

  test('renders description when provided', () => {
    const description = wrapper.find('.repository-base-edit__description');
    expect(description.exists()).toBe(true);
    expect(description.text()).toBe('Test Description');
  });

  test('does not render description when not provided', async () => {
    await wrapper.setProps({ description: '' });
    const description = wrapper.find('.repository-base-edit__description');
    expect(description.exists()).toBe(false);
  });

  test('applies correct classes based on isNoSpaceContainer prop to description section', async () => {
    const descriptionSection = wrapper.find(
      '.repository-base-edit__description',
    );
    expect(descriptionSection.exists()).toBe(true);

    await wrapper.setProps({ isNoSpaceContainer: true });
    const noPaddingClass = wrapper.find('.page-container--no-padding');
    expect(noPaddingClass.exists()).toBe(true);
  });
});
