import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';

import AddSitesContent from '../AddSitesContent.vue';
import StartAddContent from '../StartAddContent.vue';

describe('AddSitesContent.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(AddSitesContent);
  });

  it('matches the snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders StartAddContent when sites array is empty', () => {
    const startContent = wrapper.findComponent(StartAddContent);
    expect(startContent.exists()).toBe(true);
    expect(startContent.props()).toEqual({
      icon: 'globe',
      iconFilled: true,
      description: expect.any(String),
      subDescription: expect.any(String),
      textAddContent: expect.any(String),
    });
  });

  it('renders the inputs of sites when sites exist', async () => {
    wrapper = mount(AddSitesContent, {
      global: { stubs: ['UnnnicInput'] },
    });

    wrapper.vm.addEmptySite();

    await wrapper.vm.$nextTick();

    const siteInputs = wrapper.findAll('[data-testid="site-input"]');
    expect(siteInputs.length).toBe(1);
  });

  it('adds a new site when the add button is clicked', async () => {
    wrapper.vm.addEmptySite();

    await wrapper.vm.$nextTick();

    const addButton = wrapper.find('[data-testid="add-button"]');
    expect(addButton.exists()).toBe(true);

    const input = wrapper.find('input');
    await input.setValue('http://example.com');

    await addButton.trigger('click');

    const siteList = wrapper.findAll('[data-testid="site-item"]');
    expect(siteList.length).toBe(2);
    expect(siteList[1].find('input').element.value).toBe('');
  });

  it('emits the correct valid sites when a valid site is input', async () => {
    wrapper.vm.addEmptySite();

    await wrapper.vm.$nextTick();

    const input = wrapper.find('input');
    await input.setValue('http://example.com');

    const emitted = wrapper.emitted('update:model-value');
    expect(emitted).toBeTruthy();
    expect(emitted[1]).toEqual([['http://example.com']]);
  });
});
