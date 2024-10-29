import { mount, RouterLinkStub } from '@vue/test-utils';
import BrainWarningBar from '@/components/Brain/BrainWarningBar.vue';

describe('BrainWarningBar', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(BrainWarningBar, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    });
  });

  test('renders the component correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('renders the warning message correctly', () => {
    const intelligenceText = wrapper.findComponent(
      '[data-test="news-bar-text"]',
    );
    expect(intelligenceText.exists()).toBe(true);
    expect(intelligenceText.text()).toContain(
      wrapper.vm.$t('router.warn.brain_is_deactivated'),
    );
    expect(intelligenceText.text()).toContain(
      wrapper.vm.$t('router.warn.click_here'),
    );
  });

  test('renders the RouterLink correctly with the correct props', () => {
    const routerLink = wrapper.findComponent(RouterLinkStub);
    expect(routerLink.exists()).toBe(true);
    expect(routerLink.props().to).toEqual({
      name: 'router-tunings',
      query: { activate_brain: true },
    });
  });

  test('validates the "to" prop in RouterLink', () => {
    const routerLink = wrapper.findComponent(RouterLinkStub);
    expect(routerLink.exists()).toBe(true);

    const expectedTo = {
      name: 'router-tunings',
      query: { activate_brain: true },
    };

    expect(routerLink.props('to')).toEqual(expectedTo);
  });
});
