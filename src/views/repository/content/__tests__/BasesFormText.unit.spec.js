import nexusaiAPI from '@/api/nexusaiAPI';
import { mount } from '@vue/test-utils';
import { beforeEach, expect } from 'vitest';
import BasesFormText from '../BasesFormText.vue';
import Unnnic from '@weni/unnnic-system';

const response = {
  data: {
    text: 'Hello World Edited!',
    uuid: '1234',
  },
};

const callAlert = vi.spyOn(Unnnic, 'unnnicCallAlert');

const editRequest = vi
  .spyOn(nexusaiAPI.intelligences.contentBases.texts, 'edit')
  .mockResolvedValue(response);

const createRequest = vi
  .spyOn(nexusaiAPI.intelligences.contentBases.texts, 'create')
  .mockResolvedValue(response);

describe('BasesFormText.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(BasesFormText, {
      props: {
        modelValue: 'Hello World!',
        item: {
          open: true,
          status: null,
          uuid: '1234',
          oldValue: 'Hello World!',
          value: 'Hello World!',
        },
      },

      global: {
        mocks: {
          $route: {
            params: {
              contentBaseUuid: '5678',
            },
          },
        },
      },
    });
  });

  describe.each([{ textUuid: null }, { textUuid: '1234' }])(
    `when text uuid is $textUuid`,
    ({ textUuid }) => {
      beforeEach(() => {
        wrapper = mount(BasesFormText, {
          props: {
            modelValue: 'Hello World!',
            item: {
              open: true,
              status: null,
              uuid: textUuid,
              oldValue: 'Hello World!',
              value: 'Hello World!',
            },
          },

          global: {
            mocks: {
              $route: {
                params: {
                  contentBaseUuid: '5678',
                },
              },
            },
          },
        });
      });

      describe('when the user edits the textarea', () => {
        beforeEach(async () => {
          const textarea = wrapper.find('textarea');

          textarea.wrapperElement.value = 'Hello World Edited!';

          textarea.wrapperElement.dispatchEvent(
            new Event('input', { bubbles: true }),
          );

          await wrapper.setProps({
            item: {
              ...wrapper.props('item'),
              value: textarea.wrapperElement.value,
            },
            modelValue: textarea.wrapperElement.value,
          });
        });

        it('emits update:modelValue with edited value', async () => {
          expect(wrapper.emitted('update:modelValue')).toContainEqual([
            'Hello World Edited!',
          ]);
        });

        describe('when the user clicks the save button', () => {
          beforeEach(async () => {
            const saveButton = wrapper.find('[data-test="save-button"]');

            await saveButton.trigger('click');
          });

          if (textUuid) {
            it('should call edit method', () => {
              expect(editRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                  contentBaseUuid: '5678',
                  contentBaseTextUuid: '1234',
                  text: 'Hello World Edited!',
                }),
              );
            });
          } else {
            it('should call create method', () => {
              expect(createRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                  contentBaseUuid: '5678',
                  text: 'Hello World Edited!',
                }),
              );
            });
          }
        });
      });
    },
  );

  describe('when an error occurs when trying to save text', () => {
    beforeEach(() => {
      vi.clearAllMocks();

      editRequest.mockRejectedValue({
        response: {
          data: {
            text: ['Error found'],
          },
        },
      });
    });

    it('should call alert with error message', async () => {
      const textarea = wrapper.find('textarea');

      textarea.wrapperElement.value = 'Hello World Edited!';

      textarea.wrapperElement.dispatchEvent(
        new Event('input', { bubbles: true }),
      );

      await wrapper.setProps({
        item: {
          ...wrapper.props('item'),
          value: textarea.wrapperElement.value,
        },
        modelValue: textarea.wrapperElement.value,
      });

      const saveButton = wrapper.find('[data-test="save-button"]');

      await saveButton.trigger('click');

      expect(callAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          props: {
            icon: 'alert-circle-1',
            scheme: 'feedback-red',
            text: 'Error found',
          },
          seconds: 5,
        }),
      );
    });
  });

  describe('when text is loading', () => {
    beforeEach(() => {
      wrapper = mount(BasesFormText, {
        props: {
          modelValue: 'Hello World!',
          item: {
            open: true,
            isLoading: true,
            uuid: '1234',
            oldValue: 'Hello World!',
            value: 'Hello World!',
          },
        },
      });
    });

    it('should show skeleton loading', () => {
      const loading = wrapper.findComponent({ name: 'UnnnicSkeletonLoading' });

      expect(loading.exists()).toBeTruthy();
    });
  });
});
