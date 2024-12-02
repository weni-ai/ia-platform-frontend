import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import StartAddContent from '../StartAddContent.vue';

describe('StartAddContent.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(StartAddContent, {
      props: {
        icon: 'custom-icon',
        iconFilled: false,
        description: 'This is a description',
        subDescription: 'This is a sub-description',
        textAddContent: 'Add Item',
      },
    });
  });

  it('matches the snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders the icon with correct props', () => {
    const icon = wrapper.findComponent('[data-testid="icon"]');
    expect(icon.exists()).toBe(true);
    expect(icon.props('icon')).toBe('custom-icon');
    expect(icon.props('filled')).toBe(false);
  });

  it('renders description and subDescription texts', () => {
    const description = wrapper.find('[data-testid="description"]');
    const subDescription = wrapper.find('[data-testid="sub-description"]');
    expect(description.exists()).toBe(true);
    expect(description.text()).toBe('This is a description');
    expect(subDescription.exists()).toBe(true);
    expect(subDescription.text()).toBe('This is a sub-description');
  });

  it('renders the add content button with correct text', () => {
    const button = wrapper.findComponent('[data-testid="add-button"]');
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain('Add Item');
  });

  it('emits the "add" event when button is clicked', async () => {
    const button = wrapper.findComponent('[data-testid="add-button"]');
    await button.trigger('click');

    expect(wrapper.emitted('add')).toBeTruthy();
    expect(wrapper.emitted('add').length).toBe(1);
  });
});
