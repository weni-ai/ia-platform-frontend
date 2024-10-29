import { mount } from '@vue/test-utils';
import HistoryData from '@/components/Brain/Tunings/HistoryData.vue';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';

describe('HistoryData.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(HistoryData, {
      props: {
        text: 'Sample history text',
        isRenderIcon: true,
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test('renders the correct text prop', () => {
    const textElement = wrapper.find('.history-data__text');
    expect(textElement.text()).toBe('Sample history text');
  });

  test('renders UnnnicButton when isRenderIcon is true', () => {
    const buttonComponent = wrapper.findComponent({ name: 'UnnnicButton' });
    expect(buttonComponent.exists()).toBe(true);
  });

  test('does not render UnnnicButton when isRenderIcon is false', async () => {
    await wrapper.setProps({ isRenderIcon: false });
    const buttonComponent = wrapper.findComponent({ name: 'UnnnicButton' });
    expect(buttonComponent.exists()).toBe(false);
  });

  test('toggles collapse state and emits update:isCollapsed when UnnnicButton is clicked', async () => {
    const buttonComponent = wrapper.findComponent({ name: 'UnnnicButton' });
    await buttonComponent.trigger('click');

    expect(wrapper.vm.isCollapsed).toBe(true);
    expect(wrapper.emitted('update:isCollapsed')).toBeTruthy();
    expect(wrapper.emitted('update:isCollapsed')[0]).toEqual([true]);

    await buttonComponent.trigger('click');
    expect(wrapper.vm.isCollapsed).toBe(false);
    expect(wrapper.emitted('update:isCollapsed')[1]).toEqual([false]);
  });

  test('renders the correct icon based on isCollapsed state', async () => {
    let buttonComponent = wrapper.findComponent({ name: 'UnnnicButton' });
    expect(buttonComponent.props('iconCenter')).toBe('keyboard_arrow_down');

    await buttonComponent.trigger('click');
    buttonComponent = wrapper.findComponent({ name: 'UnnnicButton' });
    expect(buttonComponent.props('iconCenter')).toBe('keyboard_arrow_up');
  });
});
