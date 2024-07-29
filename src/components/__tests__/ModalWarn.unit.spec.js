import { mount } from '@vue/test-utils';
import ModalWarn from '@/components/ModalWarn.vue';

const UnnnicModalStub = {
  template: `
    <section>
      <slot name="message" />
      <slot name="options" />
    </section>
  `,
};

const setup = () =>
  mount(ModalWarn, {
    props: {
      title: 'Modal Warn Title',
      description: 'Modal Warn Description',
      message: 'Modal Warn Message',
      closeText: 'Close',
      actionText: 'Action',
    },

    global: {
      stubs: {
        UnnnicModal: UnnnicModalStub,
      },
    },
  });

describe('ModalWarn.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });

  it('should pass the correct attributes to UnnnicModal component', () => {
    const modal = wrapper.findComponent(UnnnicModalStub);

    expect(modal.attributes()).toEqual(
      expect.objectContaining({
        scheme: 'aux-yellow-500',
        modalicon: 'warning',
        text: 'Modal Warn Title',
        description: 'Modal Warn Description',
        closeicon: 'false',
      }),
    );
  });

  describe.each([
    { button: 'close-button', eventName: 'close' },
    { button: 'action-button', eventName: 'action' },
  ])(`when the user clicks on $button`, ({ button, eventName }) => {
    it(`emits ${eventName} event`, () => {
      wrapper.find(`[data-test="${button}"]`).trigger('click');

      expect(wrapper.emitted(eventName)).toHaveLength(1);
    });
  });
});
