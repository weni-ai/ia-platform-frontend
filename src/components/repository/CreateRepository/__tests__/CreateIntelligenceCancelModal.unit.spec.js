import { config, mount } from '@vue/test-utils';
import CreateIntelligenceCancelModal from '@/components/repository/CreateRepository/CreateIntelligenceCancelModal.vue';
import i18n from '@/utils/plugins/i18n';

beforeAll(() => {
  config.global.plugins = config.global.plugins.filter(
    (plugin) => plugin !== i18n,
  );
});

afterAll(() => {
  if (!config.global.plugins.includes(i18n)) {
    config.global.plugins.push(i18n);
  }
});

const setup = () =>
  mount(CreateIntelligenceCancelModal, {
    global: {
      mocks: {
        $t: (key) => key,
      },
    },
  });

const elements = {
  unnnicModal: { name: 'UnnnicModal' },
  cancelButton: '[data-test="cancel-button"]',
  cancelCreateButton: '[data-test="cancel-create-button"]',
};

describe('CreateIntelligenceCancelModal.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });

  it('should pass the correct props to UnnnicModal', () => {
    expect(wrapper.findComponent(elements.unnnicModal).props()).toEqual(
      expect.objectContaining({
        text: 'webapp.create_repository.modal_title',
        modalIcon: 'warning',
        closeIcon: false,
        showModal: true,
        scheme: 'aux-yellow-500',
        persistent: false,
      }),
    );
  });

  it('should render cancel description', () => {
    expect(wrapper.text()).toContain(
      'webapp.create_repository.modal_description',
    );
  });

  describe('when the UnnnicModal emits close event', () => {
    it('emits close event', () => {
      wrapper.findComponent(elements.unnnicModal).vm.$emit('close');

      expect(wrapper.emitted('close')).toHaveLength(1);
    });
  });

  describe.each([
    {
      button: elements.cancelButton,
      eventName: 'close',
    },
    {
      button: elements.cancelCreateButton,
      eventName: 'cancelCreateIntelligence',
    },
  ])('when the user clicks on $button', ({ button, eventName }) => {
    it(`emits ${eventName} event`, () => {
      wrapper.find(button).trigger('click');

      expect(wrapper.emitted(eventName)).toHaveLength(1);
    });
  });
});
