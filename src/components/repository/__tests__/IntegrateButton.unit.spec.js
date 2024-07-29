import { mount } from '@vue/test-utils';
import IntegrateButton from '@/components/repository/IntegrateButton.vue';

const setup = () => mount(IntegrateButton, {});

describe('IntegrateButton.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });

  describe('when the user clicks on integrate button', () => {
    it('emits click event', () => {
      wrapper.find('[data-test="integrate-button"]').trigger('click');

      expect(wrapper.emitted('click')).toHaveLength(1);
    });
  });
});
