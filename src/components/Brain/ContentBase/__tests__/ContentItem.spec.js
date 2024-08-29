import { mount } from '@vue/test-utils';
import ContentItem from '@/components/Brain/ContentBase/ContentItem.vue';
import nexusaiAPI from '@/api/nexusaiAPI';

nexusaiAPI.intelligences.contentBases.files.download = vi
  .fn()
  .mockResolvedValue({
    data: {
      file: 'https://link.api/link-to-the-file',
    },
  });

function createFileObject(
  type,
  { status = 'uploaded', created_at = '2024-01-01T00:00:00.000Z' } = {},
) {
  const now = new Date().toISOString();

  return {
    action: {
      uuid: '1234',
      extension_file: 'action',
      created_file_name: 'Name of the Action',
      description: 'When the user wants to go to this action',
      created_at: now,
      status,
    },
    site: {
      uuid: '1234',
      link: 'https://website.com/pathname/',
      status,
      created_at,
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
      created_at,
    },
  }[type];
}

describe('ContentItem.vue', () => {
  let wrapper;

  describe('when it is an action', () => {
    beforeEach(() => {
      wrapper = mount(ContentItem, {
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

    it('can be removed', async () => {
      const buttonRemove = wrapper.find('[data-test="action-remove"]');

      expect(buttonRemove.exists()).toBe(true);

      await buttonRemove.trigger('click');

      expect(wrapper.emitted('remove')).toHaveLength(1);
    });

    describe('when user clicks inside the component', () => {
      it('emits click event', async () => {
        await wrapper.element.firstElementChild.click();

        expect(wrapper.emitted('click')).toHaveLength(1);
      });
    });

    // Test for `actions` method
    it('returns an empty actions array', () => {
      const actions = wrapper.vm.actions;
      expect(actions).toEqual([]);
    });
  });

  describe('when it is a site', () => {
    beforeEach(() => {
      wrapper = mount(ContentItem, {
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

    describe('when user clicks to see actions', () => {
      beforeEach(async () => {
        const dropdownAction = wrapper.find('[data-test="dropdown-actions"]');
        await dropdownAction.trigger('click');
      });

      describe('when user clicks to see details', () => {
        it('displays FilePreview component', async () => {
          const action = wrapper.find('[data-test="See details"]');

          expect(wrapper.find('file-preview-stub').exists()).toBe(false);

          await action.trigger('click');

          expect(wrapper.find('file-preview-stub').exists()).toBe(true);
        });
      });

      describe('when user clicks to remove site', () => {
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
      wrapper = mount(ContentItem, {
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

    it('shows the name of the file', () => {
      const name = wrapper.find('[data-test="name"]');

      expect(name.text()).toBe('Name of the Text.txt');
    });

    describe('when user clicks to see actions', () => {
      beforeEach(async () => {
        const dropdownAction = wrapper.find('[data-test="dropdown-actions"]');
        await dropdownAction.trigger('click');
      });

      describe('when user clicks to see details', () => {
        it('displays FilePreview component', async () => {
          const action = wrapper.find('[data-test="See details"]');

          expect(wrapper.find('file-preview-stub').exists()).toBe(false);

          await action.trigger('click');

          expect(wrapper.find('file-preview-stub').exists()).toBe(true);
        });
      });

      describe('when user clicks to download file', () => {
        it('downloads the file', async () => {
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

      describe('when user clicks to remove file', () => {
        it('emits remove event', async () => {
          const action = wrapper.find('[data-test="Remove file"]');

          await action.trigger('click');

          expect(wrapper.emitted('remove')).toHaveLength(1);
        });
      });

      // Test for `formatTimeAgo` method
      describe('formatTimeAgo', () => {
        describe('when the date is invalid', () => {
          beforeEach(() => {
            wrapper = mount(ContentItem, {
              props: {
                file: createFileObject('file', { created_at: 'invalid-date' }),
                clickable: false,
                compressed: true,
              },
            });
          });

          it('returns uploading status message', () => {
            const timeAgo = wrapper.vm.timeAgo;
            expect(timeAgo).toBe('Uploading content');
          });

          it('returns "Uploading..." when dateString is null or empty', () => {
            const resultWithNull = wrapper.vm.formatTimeAgo(null);
            expect(resultWithNull).toBe('Uploading content');

            const resultWithEmptyString = wrapper.vm.formatTimeAgo('');
            expect(resultWithEmptyString).toBe('Uploading content');
          });
        });

        describe('when the difference is less than 60 minutes', () => {
          beforeEach(() => {
            wrapper = mount(ContentItem, {
              props: {
                file: createFileObject('file', {
                  created_at: new Date(
                    Date.now() - 30 * 60 * 1000,
                  ).toISOString(),
                }), // 30 minutes ago
                clickable: false,
                compressed: true,
              },
            });
          });

          it('returns time ago in minutes', () => {
            const timeAgo = wrapper.vm.timeAgo;
            expect(timeAgo).toBe('Added 30 minutes ago');
          });
        });

        describe('when the difference is less than 24 hours', () => {
          beforeEach(() => {
            wrapper = mount(ContentItem, {
              props: {
                file: createFileObject('file', {
                  created_at: new Date(
                    Date.now() - 5 * 60 * 60 * 1000,
                  ).toISOString(),
                }), // 5 hours ago
                clickable: false,
                compressed: true,
              },
            });
          });

          it('returns time ago in hours', () => {
            const timeAgo = wrapper.vm.timeAgo;
            expect(timeAgo).toBe('Added 5 hours ago');
          });
        });

        describe('when the difference is more than 24 hours', () => {
          beforeEach(async () => {
            wrapper = mount(ContentItem, {
              props: {
                file: createFileObject('file', {
                  created_at: new Date(
                    Date.now() - 3 * 24 * 60 * 60 * 1000,
                  ).toISOString(),
                }),
                clickable: false,
                compressed: true,
              },
            });
          });

          it('returns time ago in days', () => {
            const timeAgo = wrapper.vm.timeAgo;
            expect(timeAgo).toBe('Added 3 days ago');
          });
        });
      });
    });
  });

  describe('when it is a file with fail status', () => {
    beforeEach(() => {
      wrapper = mount(ContentItem, {
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
