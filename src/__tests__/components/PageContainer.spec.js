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
        dontShowBack: false,
        brainIsDeactivated: false,
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

  test('displays brain deactivated warning when brainIsDeactivated is true', async () => {
    await wrapper.setProps({ brainIsDeactivated: true });
    const warningSection = wrapper.find('.news-bar--warn');
    expect(warningSection.exists()).toBe(true);
    expect(warningSection.text()).toContain(
      wrapper.vm.$t('router.warn.brain_is_deactivated'),
    );
  });

  test('renders back button and emits back event', async () => {
    const backButton = wrapper.findAll('.unnnic-button').at(0);
    expect(backButton.exists()).toBe(true);

    await backButton.trigger('click');
    expect(wrapper.emitted('back')).toBeTruthy();
  });

  test('does not render back button when dontShowBack is true', async () => {
    await wrapper.setProps({ dontShowBack: true });
    const backButton = wrapper.findComponent({ name: 'UnnnicButton' });
    expect(backButton.exists()).toBe(false);
  });

  test('renders the title correctly', () => {
    const title = wrapper.find('.repository-base-edit__title');
    expect(title.text()).toBe('Test Title');
  });

  test('renders skeleton loader when loadingTitle is true', async () => {
    await wrapper.setProps({ loadingTitle: true });
    const skeletonLoader = wrapper.findComponent({
      name: 'UnnnicSkeletonLoading',
    });
    expect(skeletonLoader.exists()).toBe(true);
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
});
