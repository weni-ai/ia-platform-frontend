import { mount } from '@vue/test-utils';
import BasesFormFilesItem from '@/views/repository/content/BasesFormFilesItem.vue';
import nexusaiAPI from '@/api/nexusaiAPI';

nexusaiAPI.intelligences.contentBases.files.download = vi
  .fn()
  .mockResolvedValue({
    data: {
      file: 'https://link.api/link-to-the-file',
    },
  });

function createFileObject(type, { status } = { status: 'uploaded' }) {
  return {
    action: {
      uuid: '1234',
      extension_file: 'action',
      created_file_name: 'Name of the Action',
      description: 'When the user wants to go to this action',
    },
    site: {
      uuid: '1234',
      link: 'https://website.com/pathname/',
      status,
      created_at: '2024-05-01T00:00:00.000000Z',
      extension_file: 'site',
      created_file_name: 'https://website.com/pathname/',
    },
    file: {
      file: null,
      extension_file: 'txt',
      uuid: '00bf7cd5-d6ce-47b8-b982-2b2939765bf8',
      created_file_name: 'Name of the Text',
      status,
      file_name: 'Name of the Text-1618c0f6-60f7-4540-8a9a-77fd77c6c8c3.txt',
      created_at: '2024-07-01T00:00:00.000000Z',
    },
  }[type];
}

describe('BasesFormFilesItem.vue', () => {
  let wrapper;

  describe('when it is an action', () => {
    beforeEach(() => {
      wrapper = mount(BasesFormFilesItem, {
        props: {
          file: createFileObject('action'),
          clickable: true,
          compressed: true,
        },
      });
    });

    it('shows the name of the action', () => {
      const name = wrapper.find('[data-test="name"]');

      expect(name.text()).toBe('Name of the Action');
    });

    it('can be deleted', async () => {
      const buttonDelete = wrapper.find('[data-test="action-remove"]');

      expect(buttonDelete.exists()).toBe(true);

      await buttonDelete.trigger('click');

      expect(wrapper.emitted('remove')).toHaveLength(1);
    });

    describe('when user clicks inside the component', () => {
      it('emits click event', async () => {
        await wrapper.element.firstElementChild.click();

        expect(wrapper.emitted('click')).toHaveLength(1);
      });
    });
  });

  describe('when it is a site', () => {
    beforeEach(() => {
      wrapper = mount(BasesFormFilesItem, {
        props: {
          file: createFileObject('site'),
          clickable: false,
          compressed: true,
        },

        global: {
          stubs: ['FilePreview'],

          mocks: {
            $store: {
              state: {
                Auth: {
                  connectProjectUuid: '5678',
                },
                router: {
                  contentBaseUuid: '4321',
                },
              },
            },
          },
        },
      });
    });

    it('shows the link of the site', () => {
      const link = wrapper.find('[data-test="name"]');

      expect(link.text()).toBe('https://website.com/pathname/');
    });

    describe('when user clicks to see the actions', () => {
      beforeEach(async () => {
        const dropdownAction = wrapper.find('[data-test="dropdown-actions"]');
        await dropdownAction.trigger('click');
      });

      describe.skip('when user clicks to see details', () => {
        it('displays FilePreview component', async () => {
          const action = wrapper.find('[data-test="See details"]');

          expect(wrapper.find('file-preview-stub').exists()).toBe(false);

          await action.trigger('click');

          expect(wrapper.find('file-preview-stub').exists()).toBe(true);
        });
      });

      describe('when user clicks remove site', () => {
        it('emits remove event', async () => {
          const action = wrapper.find('[data-test="Remove site"]');

          await action.trigger('click');

          expect(wrapper.emitted('remove')).toHaveLength(1);
        });
      });
    });
  });

  describe('when it is a file', () => {
    beforeEach(() => {
      wrapper = mount(BasesFormFilesItem, {
        props: {
          file: createFileObject('file'),
          clickable: false,
          compressed: true,
        },

        global: {
          stubs: ['FilePreview'],

          mocks: {
            $store: {
              state: {
                Auth: {
                  connectProjectUuid: '5678',
                },
                router: {
                  contentBaseUuid: '4321',
                },
              },
            },
          },
        },
      });
    });

    it('hides processing bar', () => {
      const processingBar = wrapper.find('[data-test="processing-bar"]');

      expect(processingBar.exists()).toBe(false);
    });

    it('shows the name of the file', () => {
      const name = wrapper.find('[data-test="name"]');

      expect(name.text()).toBe('Name of the Text.txt');
    });

    describe('when user clicks to see the actions', () => {
      beforeEach(async () => {
        const dropdownAction = wrapper.find('[data-test="dropdown-actions"]');
        await dropdownAction.trigger('click');
      });

      describe.skip('when user clicks to see details', () => {
        it('displays FilePreview component', async () => {
          const action = wrapper.find('[data-test="See details"]');

          expect(wrapper.find('file-preview-stub').exists()).toBe(false);

          await action.trigger('click');

          expect(wrapper.find('file-preview-stub').exists()).toBe(true);
        });
      });

      describe('when user clicks to download file', () => {
        it('downloads the file', async () => {
          const mockAnchor = {
            href: '',
            download: '',
            click: vi.fn(),
            setAttribute: vi.fn(),
          };

          let clickedAnchorHTML = '';

          vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
            function () {
              clickedAnchorHTML = this.outerHTML;
            },
          );

          const action = wrapper.find('[data-test="Download file"]');

          await action.trigger('click');

          expect(
            nexusaiAPI.intelligences.contentBases.files.download,
          ).toHaveBeenCalledWith({
            file_name:
              'Name of the Text-1618c0f6-60f7-4540-8a9a-77fd77c6c8c3.txt',
            fileUuid: '00bf7cd5-d6ce-47b8-b982-2b2939765bf8',
          });

          expect(clickedAnchorHTML).toBe(
            '<a download="Name of the Text.txt" href="https://link.api/link-to-the-file"></a>',
          );
        });
      });

      describe('when user clicks remove file', () => {
        it('emits remove event', async () => {
          const action = wrapper.find('[data-test="Remove file"]');

          await action.trigger('click');

          expect(wrapper.emitted('remove')).toHaveLength(1);
        });
      });
    });
  });

  describe('when it is a file with processing status', () => {
    beforeEach(() => {
      wrapper = mount(BasesFormFilesItem, {
        props: {
          file: createFileObject('file', { status: 'processing' }),
          clickable: false,
          compressed: true,
        },
      });
    });

    it('shows processing bar', () => {
      const processingBar = wrapper.find('[data-test="processing-bar"]');

      expect(processingBar.exists()).toBe(true);
    });
  });

  describe('when it is a file with fail status', () => {
    beforeEach(() => {
      wrapper = mount(BasesFormFilesItem, {
        props: {
          file: createFileObject('file', { status: 'fail' }),
          clickable: false,
          compressed: true,
        },
      });
    });

    it('shows warning icon', () => {
      const itemIcon = wrapper.find('[data-test="item-icon"]');

      expect(itemIcon.text()).toBe('warning');
    });
  });
});
