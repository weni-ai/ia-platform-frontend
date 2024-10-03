import { mount } from '@vue/test-utils';
import SidebarMenu from '@/components/Sidebar/SidebarMenu.vue';
import { expect } from 'vitest';

describe('SidebarMenu', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(SidebarMenu, {
      props: {
        text: 'Menu Title',
      },
    });
  });

  test('renders the component correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('renders the title text correctly', () => {
    const title = wrapper.find('.unnnic-side-bar-menu__title');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('Menu Title');
  });

  test('renders without title when text prop is not provided', async () => {
    await wrapper.setProps({ text: null });
    const title = wrapper.find('.unnnic-side-bar-menu__title');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('');
  });

  test('applies the correct CSS class', () => {
    expect(wrapper.classes()).toContain('unnnic-side-bar-menu');
  });

  test('allows for default slot content', async () => {
    const slotContent = '<div data-test="slot-content">Slot Content</div>';
    const wrapperWithSlot = mount(SidebarMenu, {
      slots: {
        default: slotContent,
      },
    });

    const slot = wrapperWithSlot.find('[data-test="slot-content"]');
    expect(slot.exists()).toBe(true);
    expect(slot.text()).toBe('Slot Content');
  });
});
