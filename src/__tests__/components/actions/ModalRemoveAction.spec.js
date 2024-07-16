import { mount } from '@vue/test-utils';
import ModalRemoveAction from '@/components/actions/ModalRemoveAction.vue';

describe('ModalRemoveAction', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(ModalRemoveAction, {
      props: {
        name: 'Test Item',
        removing: false,
      },
    });
  });

  test('renders correctly with given props', async () => {
    const descriptionText = wrapper.vm
      .$t('modals.actions.remove.description', {
        name: 'Test Item',
      })
      .replace(/<br\s*\/>/g, '<br>');

    const descriptionElement = wrapper.findAll('p').at(0).element.innerHTML;

    expect(descriptionElement).toBe(descriptionText);

    expect(wrapper.text()).toContain(
      wrapper.vm.$t('modals.actions.remove.title'),
    );
    expect(wrapper.text()).toContain(
      wrapper.vm.$t('modals.actions.btn_cancel'),
    );
    expect(wrapper.text()).toContain(
      wrapper.vm.$t('modals.actions.btn_complete'),
    );
  });

  test('emits closeModal event when cancel button is clicked', async () => {
    const cancelButton = wrapper.findAll('.unnnic-button').at(0);
    await cancelButton.trigger('click');
    expect(wrapper.emitted('closeModal')).toBeTruthy();
  });

  test('emits remove event when remove button is clicked', async () => {
    const removeButton = wrapper.findAll('.unnnic-button').at(1);
    await removeButton.trigger('click');
    expect(wrapper.emitted('remove')).toBeTruthy();
  });

  test('shows loading state on remove button when removing is true', async () => {
    await wrapper.setProps({ removing: true });
    const removeButton = wrapper.findAll('.unnnic-button').at(1);
    // Checks if there are any SVG elements inside the button
    const svgIcon = removeButton.find('svg');
    // Checks if it found any SVGs (indicates that loading is active)
    expect(svgIcon.exists()).toBe(true);
  });

  test('removing prop works correctly', async () => {
    expect(wrapper.findAll('.unnnic-button').at(1).find('svg').exists()).toBe(
      false,
    );
    await wrapper.setProps({ removing: true });
    expect(wrapper.findAll('.unnnic-button').at(1).find('svg').exists()).toBe(
      true,
    );
  });
});
