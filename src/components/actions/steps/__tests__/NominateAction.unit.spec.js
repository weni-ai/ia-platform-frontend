import { mount } from '@vue/test-utils';
import NominateAction from '../NominateAction.vue';

describe('ModalActions.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(NominateAction, {
      props: {
        name: 'Name',
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
});
