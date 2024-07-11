import { mount } from '@vue/test-utils';
import ModalChangeAction from '@/components/actions/ModalChangeAction.vue';

describe('ModalChangeAction', () => {
  let wrapper;

  const createComponent = (propsData) => {
    wrapper = mount(ModalChangeAction, {
      props: propsData,
      stubs: {
        ModalNext: true,
      },
    });
  };

  afterEach(() => {
    wrapper.unmount();
  });

  test('renders correctly with given props', async () => {
    createComponent({
      description: 'Test description',
      item: 'Test item',
      editing: false,
    });

    await wrapper.vm.$nextTick();

    const title = wrapper.find('.flow-modal__header h3');
    const item = wrapper.find('.flow-modal__header h4');
    const subTitle = wrapper.find('.flow-modal__header p');

    expect(title.exists()).toBe(true);
    expect(title.text()).toBe(
      wrapper.vm.$t('modals.actions.descriptions.change_title'),
    );

    expect(item.exists()).toBe(true);
    expect(item.text()).toBe('Test item');

    expect(subTitle.exists()).toBe(true);
    expect(subTitle.text()).toBe(
      wrapper.vm.$t('modals.actions.descriptions.change_sub_title'),
    );
  });

  test('emits closeModal event on cancel button click', async () => {
    createComponent({
      description: 'Test description',
      item: 'Test item',
      editing: false,
    });

    const cancelButton = wrapper.findAll('.unnnic-button').at(0);
    await cancelButton.trigger('click');

    expect(wrapper.emitted('closeModal')).toBeTruthy();
  });

  test('emits edit event on complete button click', async () => {
    createComponent({
      description: 'Test description',
      item: 'Test item',
      editing: false,
    });

    const completeButton = wrapper.findAll('.unnnic-button').at(1);
    await completeButton.trigger('click');

    expect(wrapper.emitted('edit')).toBeTruthy();
  });

  test('disables complete button when editing is true', () => {
    createComponent({
      description: 'Test description',
      item: 'Test item',
      editing: true,
    });

    const completeButton = wrapper.findAll('.unnnic-button').at(1);

    // Checks if there are any SVG elements inside the button
    const svgIcon = completeButton.find('svg');

    // Checks if it found any SVGs (indicates that loading is active)
    expect(svgIcon.exists()).toBe(true);
  });
});
