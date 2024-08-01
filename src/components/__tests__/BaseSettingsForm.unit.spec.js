import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import BaseSettingsForm from '@/components/BaseSettingsForm.vue';
import nexusaiAPI from '@/api/nexusaiAPI';

const elements = {
  nameInput: '[data-test="name-input"]',
  languageSelect: '[data-test="language-select"]',
  descriptionTextarea: '[data-test="description-textarea"]',
  cancelButton: '[data-test="cancel-button"]',
  actionButton: '[data-test="action-button"]',
};

const store = createStore({
  state() {
    return {
      User: { me: { language: 'en-us' } },
    };
  },
});

const createRequest = vi
  .spyOn(nexusaiAPI, 'createIntelligenceContentBase')
  .mockResolvedValue({
    data: { message: 'success' },
  });

const patchRequest = vi
  .spyOn(nexusaiAPI, 'patchIntelligenceContentBase')
  .mockResolvedValue({
    data: { message: 'success' },
  });

const setup = ({ contentBaseUuid = '1234', preFilledValues } = {}) =>
  mount(BaseSettingsForm, {
    props: {
      contentBaseUuid,
      intelligenceUuid: '5678',
      preFilledValues,
    },

    global: {
      plugins: [store],
    },
  });

describe('BaseSettingsForm.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();

    store.state.User.me.language = 'en-us';
  });

  describe('when the user clicks on cancel button', () => {
    it('emits close event', () => {
      wrapper.find(elements.cancelButton).trigger('click');

      expect(wrapper.emitted('close')).toHaveLength(1);
    });
  });

  describe('when the user has a unkown language', () => {
    it('should use pt-br as fallback language', () => {
      store.state.User.me.language = 'unknown-language';

      wrapper = setup();

      expect(wrapper.vm.language).toBe('pt-br');
    });
  });

  describe.each([
    { contentBaseUuid: null, request: createRequest },
    {
      contentBaseUuid: '1234',
      request: patchRequest,
      preFilledValues: {
        language: 'en-us',
        title: 'Initial Title',
        description: 'Initial Description',
      },
    },
  ])(
    'when the contentBaseUuid is $contentBaseUuid',
    ({ contentBaseUuid, request, preFilledValues }) => {
      beforeEach(() => {
        wrapper = setup({ contentBaseUuid, preFilledValues });
      });

      describe('when the user fills the name and the description', () => {
        beforeEach(() => {
          wrapper
            .findComponent(elements.nameInput)
            .vm.$emit('update:modelValue', 'Base Name');

          wrapper
            .findComponent(elements.descriptionTextarea)
            .vm.$emit('update:modelValue', 'Base Description');
        });

        it('action button should not be disabled', () => {
          expect(wrapper.find(elements.actionButton).isDisabled()).toBeFalsy();
        });

        describe('whe the user submits', () => {
          beforeEach(() => {
            wrapper.find(elements.actionButton).trigger('click');
          });

          it('calls API to save', () => {
            expect(request).toHaveBeenCalledWith(
              expect.objectContaining({
                description: 'Base Description',
                intelligenceUuid: '5678',
                language: 'en-us',
                title: 'Base Name',
              }),
            );
          });

          it('emits close and success events', () => {
            const closeEmit = wrapper.emitted('close');

            expect(closeEmit).toHaveLength(1);

            const successEmit = wrapper.emitted('success');

            expect(successEmit).toHaveLength(1);
            expect(successEmit[0]).toEqual([{ message: 'success' }]);
          });
        });
      });
    },
  );
});
