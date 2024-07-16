import { mount } from '@vue/test-utils';
import ModalSaveChangesError from '@/views/Brain/ModalSaveChangesError.vue';
import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      Brain: {
        tabsWithError: ['personalization', 'content', 'actions', 'tunings'],
      },
    };
  },
});

describe('ModalSaveChangesError', () => {
  let wrapper;
  let tabNames;
  let tabNamesFormatted;
  let expectedDescription;

  beforeEach(() => {
    wrapper = mount(ModalSaveChangesError, {
      global: {
        plugins: [store],
        stubs: {
          UnnnicModal: true,
        },
      },
    });

    tabNames = [
      wrapper.vm.$t('router.tabs.personalization'),
      wrapper.vm.$t('router.tabs.content'),
      wrapper.vm.$t('router.tabs.actions'),
      wrapper.vm.$t('router.tabs.tunings'),
    ];

    tabNamesFormatted =
      tabNames.slice(0, -1).join(', ') + ' and ' + tabNames.at(-1);
    expectedDescription = `An error occurred while saving changes to the ${tabNamesFormatted} tabs. Try saving again.`;
  });

  test('renders the modal title correctly', () => {
    const modal = wrapper.findComponent({ name: 'UnnnicModal' });
    expect(modal.exists()).toBe(true);
    expect(modal.props('text')).toBe(
      wrapper.vm.$t('router.modal_save_changes_error.title'),
    );
  });

  test('renders the modal description correctly', () => {
    const customWrapper = mount(ModalSaveChangesError, {
      global: {
        plugins: [store],
      },
    });

    const description = customWrapper.find('p');
    expect(description.exists()).toBe(true);
    expect(description.text()).toContain(expectedDescription);
  });

  test('computed property tabs works correctly', () => {
    const tabNamesHtmlFormatted =
      tabNames
        .slice(0, -1)
        .map((tab) => `<b>${tab}</b>`)
        .join(', ') +
      ' and <b>' +
      tabNames.at(-1) +
      '</b>';
    expect(wrapper.vm.tabs).toBe(tabNamesHtmlFormatted);
  });

  test('emits close event when UnnnicModal close event is triggered', async () => {
    const modal = wrapper.findComponent({ name: 'UnnnicModal' });
    await modal.vm.$emit('close');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  test('has the correct CSS classes', () => {
    const modalElement = wrapper.find('.modal-save-changes-error');
    expect(modalElement.exists()).toBe(true);
  });
});
