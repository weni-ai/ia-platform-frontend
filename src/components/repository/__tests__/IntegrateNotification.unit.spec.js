import IntegrateNotification from '@/components/repository/IntegrateNotification.vue';
import { mount } from '@vue/test-utils';

const setup = ({ type }) =>
  mount(IntegrateNotification, {
    props: {
      type,
      title: 'Integrate Notification Title',
      message: 'Integrate Notification Message',
    },
  });

describe('IntegrateNotification.vue', () => {
  let wrapper;

  describe.each([
    {
      type: 'success',
      expectedProps: {
        scheme: 'feedback-green',
        text: 'Integrate Notification Title',
        modalIcon: 'check-circle-1-1',
        closeIcon: true,
        persistent: false,
        showModal: true,
      },
    },
    {
      type: 'error',
      expectedProps: {
        scheme: 'feedback-red',
        text: 'Integrate Notification Title',
        modalIcon: 'alert-circle-1',
        closeIcon: true,
        persistent: false,
        showModal: true,
      },
    },
  ])('when the type prop is $type', ({ type, expectedProps }) => {
    it('should pass the correct props to UnnnicModal', () => {
      wrapper = setup({ type });

      expect(wrapper.findComponent({ name: 'UnnnicModal' }).props()).toEqual(
        expect.objectContaining(expectedProps),
      );
    });
  });

  describe('when the UnnnicModal emits close event', () => {
    it('emits close event', () => {
      wrapper.findComponent({ name: 'UnnnicModal' }).vm.$emit('close');

      const closeEmit = wrapper.emitted('close');

      expect(closeEmit).toHaveLength(1);
    });
  });
});
