import { mount } from '@vue/test-utils';
import NominateAction from '../NominateAction.vue';

describe('NominateAction.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(NominateAction, {
      props: {
        name: 'Name',
        loading: false,
      },
    });
  });

  describe('when the user changes the name input', () => {
    it('emits update:name', () => {
      const input = wrapper.findComponent({ name: 'UnnnicInput' });

      input.vm.$emit('update:modelValue', 'Action Name');

      expect(wrapper.emitted('update:name')).toContainEqual(['Action Name']);
    });
  });

  describe('when loading is true', () => {
    beforeEach(() => {
      wrapper.setProps({ loading: true });
    });

    it('renders UnnnicSkeletonLoading and not UnnnicInput', () => {
      expect(
        wrapper.findComponent({ name: 'UnnnicSkeletonLoading' }).exists(),
      ).toBe(true);
      expect(wrapper.findComponent({ name: 'UnnnicInput' }).exists()).toBe(
        false,
      );
    });
  });

  describe('when loading is false', () => {
    beforeEach(() => {
      wrapper.setProps({ loading: false });
    });

    it('renders UnnnicInput and not UnnnicSkeletonLoading', () => {
      expect(wrapper.findComponent({ name: 'UnnnicInput' }).exists()).toBe(
        true,
      );
      expect(
        wrapper.findComponent({ name: 'UnnnicSkeletonLoading' }).exists(),
      ).toBe(false);
    });
  });
});
