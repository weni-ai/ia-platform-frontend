import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import ModalDeleteContentIntelligence from '@/components/repository/home/ModalDeleteContentIntelligence.vue';
import nexusaiAPI from '@/api/nexusaiAPI';

const elements = {
  modal: '[data-test="modal"]',
  cancelButton: '[data-test="cancel-button"]',
  actionButton: '[data-test="action-button"]',
};

const deleteRequest = vi
  .spyOn(nexusaiAPI, 'deleteIntelligence')
  .mockResolvedValue();

const store = createStore({
  state() {
    return {
      Auth: {
        connectOrgUuid: '1234',
      },
    };
  },
});

const setup = () =>
  mount(ModalDeleteContentIntelligence, {
    props: {
      name: 'Content Intelligence Name',
      uuid: '5678',
    },

    global: {
      plugins: [store],
    },
  });

describe('ModalDeleteContentIntelligence.vue', () => {
  let wrapper;

  describe('when the modal emits close event', () => {
    beforeEach(() => {
      wrapper = setup();

      wrapper.findComponent(elements.modal).vm.$emit('close');
    });

    it('emits close event', () => {
      expect(wrapper.emitted('close')).toHaveLength(1);
    });
  });

  describe('when the user clicks on cancel button', () => {
    beforeEach(() => {
      wrapper = setup();

      wrapper.find(elements.cancelButton).trigger('click');
    });

    it('emits close event', () => {
      expect(wrapper.emitted('close')).toHaveLength(1);
    });
  });

  describe('when the user clicks on action button', () => {
    beforeEach(() => {
      wrapper = setup();

      wrapper.find(elements.actionButton).trigger('click');
    });

    it('calls delete request', () => {
      expect(deleteRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          orgUuid: '1234',
          intelligenceUuid: '5678',
        }),
      );
    });

    it('emits removed and close events', () => {
      expect(wrapper.emitted('removed')).toHaveLength(1);
      expect(wrapper.emitted('close')).toHaveLength(1);
    });
  });
});
