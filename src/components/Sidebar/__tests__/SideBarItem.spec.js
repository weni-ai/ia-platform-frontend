import { mount } from '@vue/test-utils';
import SidebarItem from '@/components/Sidebar/SideBarItem.vue';

describe('SidebarItem', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(SidebarItem, {
      global: {
        stubs: {
          UnnnicToolTip: true,
          UnnnicIcon: true,
        },
      },
      props: {
        active: false,
        expanded: false,
        icon: 'test-icon',
        iconFilled: false,
        text: 'Test Label',
        enableTooltip: true,
      },
    });
  });

  test('renders the component correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('renders the tooltip with the correct text', () => {
    const tooltip = wrapper.findComponent('[data-test="sidebar-item-tooltip"]');
    expect(tooltip.exists()).toBe(true);
    expect(tooltip.props('text')).toBe('Test Label');
    expect(tooltip.props('enabled')).toBe(true);
  });

  test('renders the icon with the correct props', () => {
    const icon = wrapper.findComponent('[data-test="sidebar-item-icon"]');
    expect(icon.exists()).toBe(true);
    expect(icon.props('icon')).toBe('test-icon');
    expect(icon.props('filled')).toBe(false);
    expect(icon.props('size')).toBe('sm');
    expect(icon.props('scheme')).toBe('neutral-cloudy');
  });

  test('applies the active class when active prop is true', async () => {
    await wrapper.setProps({ active: true });
    expect(wrapper.classes()).toContain('unnnic-side-bar-item--active');
  });

  test('emits click event when clicked', async () => {
    const spy = vi.spyOn(wrapper.vm, 'onClick');
    await wrapper.trigger('click');
    expect(spy).toHaveBeenCalled();
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  test('renders the correct label text', () => {
    const label = wrapper.find('.unnnic-side-bar-item__label');
    expect(label.exists()).toBe(true);
    expect(label.text()).toBe('Test Label');
  });

  test('does not show tooltip when enableTooltip is false', async () => {
    await wrapper.setProps({ enableTooltip: false });
    const tooltip = wrapper.findComponent('[data-test="sidebar-item-tooltip"]');
    expect(tooltip.props('enabled')).toBe(false);
  });
});
