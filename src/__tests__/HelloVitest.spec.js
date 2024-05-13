import { describe, it, expect } from 'vitest';

import { mount } from '@vue/test-utils';
import HelloVitest from '../components/HelloVitest.vue';

describe('HelloVitest', () => {
  it('renders properly', () => {
    const wrapper = mount(HelloVitest, { propsData: { msg: 'Hello Vitest' } });
    expect(wrapper.text()).toContain('Hello Vitest');
  });
});
